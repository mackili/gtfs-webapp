from fastapi import FastAPI, HTTPException, UploadFile
from typing import Union
import requests
import subprocess
import simplejson as json
from classes import *
import sys
from pydantic import ValidationError
import humps
import tempfile
import os

sys.path.insert(1, "GTFSRT")
from GTFSRT import main_rt as rt
from Import.main import importGTFS
from Surveys.upsert import (
    UpsertSurveyTemplate,
    UpsertAuthor,
    AssignAuthors,
    UpsertTemplateSection,
    UpsertTemplateQuestions,
    rollback,
)

app = FastAPI()

BASE_URL = "http://localhost:3000"


@app.get("/query")
def read_query(
    table: str,
    fields: None | str = None,
    query: None | str = None,
    limit: int | None = None,
    offset: int | None = None,
    filter: str | None = None,
    order: str | None = None,
    range: str | None = None,
):
    endpoint = BASE_URL + "/" + humps.decamelize(table)
    headers = {"Prefer": "count=exact"}
    if fields != None:
        endpoint += "?select=" + humps.decamelize(fields)
    if query != None:
        endpoint += "?" + humps.decamelize(query)
    if filter != None:
        endpoint += "&" + filter
    if order != None:
        endpoint += "&order=" + humps.decamelize(order)
    if offset != None:
        endpoint += "&offset=" + str(limit)
    if limit != None:
        endpoint += "&limit=" + str(limit)
    if range != None:
        headers["Range-Unit"] = "items"
        headers["Range"] = range

    res = requests.get(endpoint, headers=headers)
    print(endpoint)
    response = {}
    response_headers = res.headers
    if "Content-Range" in response_headers.keys():
        content_range = response_headers.get("Content-Range")
        if content_range:  # Ensure content_range is not None
            response["totalSize"] = int(content_range.split("/")[1])
            if len(content_range.split("-")) > 1:
                response["itemsStart"] = int(content_range.split("-")[0])
                response["itemsEnd"] = int(content_range.split("-")[1].split("/")[0])
            else:
                response["itemsStart"] = 0
                response["itemsEnd"] = 0
    try:
        response["items"] = res.json()
    except requests.exceptions.JSONDecodeError:
        if res.status_code == 200:
            response["items"] = []
        else:
            raise HTTPException(status_code=500)

    return humps.camelize(response)


@app.post("/read-realtime-feed")
def read_feed(options: GTFSRT_Options):
    try:
        result = rt.main(
            alerts=options.alerts,
            tripUpdates=options.tripUpdates,
            vehiclePositions=options.vehiclePositions,
            write=options.write,
            batchSize=options.batchSize,
            verbose=options.verbose,
        )
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.errors())
    return result


@app.post("/gtfs")
async def post_gtfs(file: UploadFile):
    if file.content_type != "application/zip":
        raise HTTPException(
            status_code=400, detail="Invalid data type. Only application/zip accepted"
        )
    file_content: bytes = await file.read()
    await importGTFS(file_content)

    return {"filename": file.filename}


@app.post("/upsert/{table}")
async def upsert_table(table: str, data):
    endpoint = BASE_URL + "/" + humps.decamelize(table)
    headers = {
        "Prefer": "resolution=merge-duplicates",
        "Prefer": "return=representation",
    }
    try:
        res = requests.post(endpoint, headers=headers, data=data)
        resJson = await res.json()
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    return resJson


@app.post("/surveyTemplate")
async def upsert_template(data: TemplateSummary):
    try:
        template: SurveyTemplate = await UpsertSurveyTemplate(data, BASE_URL)
        result: TemplateSummary = TemplateSummary(
            id=template.id,
            title=template.title,
            displayTitle=template.displayTitle,
            description=template.description,
            type=template.type,
        )
        result.surveyTemplateAuthors = await UpsertAuthor(data, BASE_URL)
        await AssignAuthors(BASE_URL, result.surveyTemplateAuthors, template)
        result.templateSections = await UpsertTemplateSection(
            data, BASE_URL, template.id
        )
        result.templateQuestions = await UpsertTemplateQuestions(
            data, BASE_URL, template.id
        )
        return result
    except Exception as e:
        await rollback(result, BASE_URL)
        raise HTTPException(status_code=400, detail="Transaction rolled back")
