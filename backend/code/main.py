from fastapi import FastAPI, HTTPException, UploadFile, Query
from typing import Union, Annotated
import requests
import subprocess
import simplejson as json
from classes import *
import sys
from pydantic import ValidationError, PydanticUserError
import humps
import tempfile
import datetime
from pydantic_core import from_json

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
from Surveys.delete import handle_delete_difference
from Surveys.lua import *

app = FastAPI()

BASE_URL = "http://localhost:3000"


@app.get("/query")
async def read_query(
    table: str,
    fields: None | str = None,
    query: None | str = None,
    limit: int | None = None,
    offset: int | None = None,
    filter: str | None = None,
    order: str | None = None,
    range: str | None = None,
):
    endpoint = BASE_URL + "/" + humps.decamelize(table) + "?"
    headers = {"Prefer": "count=exact"}
    if fields != None:
        endpoint += "&select=" + humps.decamelize(fields)
    if query != None:
        endpoint += "&" + humps.decamelize(query)
    if filter != None:
        endpoint += "&" + filter
    if order != None:
        endpoint += "&order=" + humps.decamelize(order)
    if offset != None:
        endpoint += "&offset=" + str(offset)
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
    await importGTFS(file_content, 5, True)

    return {"filename": file.filename}


@app.post("/{table}")
async def upsert_table(table: str, data: UpsertInput):
    endpoint = BASE_URL + "/" + humps.decamelize(table)
    headers = {
        "Prefer": "resolution=merge-duplicates,return=representation",
    }
    try:
        res = requests.post(
            endpoint, headers=headers, json=humps.decamelize(data.model_dump())
        )
        resJson = res.json()
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    return resJson


@app.post("/surveyTemplate/upsert")
async def upsert_template(
    data: TemplateSummary,
    perform_rollback: str = "false",
):
    headers = {
        "Prefer": "return=representation",
    }
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
        result.templateSections = await handle_delete_difference(
            result.templateSections,
            "templateSection",
            BASE_URL,
            headers,
            parent_id_filter=f"surveyTemplateId=eq.{result.id}",
        )
        result.templateQuestions = await UpsertTemplateQuestions(
            data, BASE_URL, template.id
        )
        await handle_delete_difference(
            result.templateQuestions,
            "templateQuestion",
            BASE_URL,
            headers,
            parent_id_filter=f"surveyTemplateId=eq.{result.id}",
        )
        return result
    except HTTPException as e:
        if perform_rollback == "true":
            await rollback(result, BASE_URL)
        raise HTTPException(status_code=400, detail=e.detail)


@app.delete("/{table}")
async def delete_table(
    table: str, ids: Annotated[list[str] | str, Query()], idLabel: str = "id"
):
    ids_list: list[str] = []
    headers = {
        "Prefer": "return=representation",
    }
    if isinstance(ids, str):
        ids_list.append(ids)
    else:
        ids_list = ids
    endpoint = f"{BASE_URL}/{humps.decamelize(table)}?{humps.decamelize(idLabel)}=in.({','.join(ids_list)})"
    try:
        res = requests.delete(endpoint, headers=headers)
        resJson = res.json()
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    return resJson


@app.post("/submit/{surveyId}")
async def upsert_submission(surveyId: str, data: CompositeSubmission):
    endpoint_submission = BASE_URL + "/" + humps.decamelize("surveySubmission")
    endpoint_answers = BASE_URL + "/" + humps.decamelize("submittedAnswer")
    headers = {
        "Prefer": "resolution=merge-duplicates,return=representation",
    }
    try:
        res_submission = requests.post(
            endpoint_submission,
            headers=headers,
            json=humps.decamelize(
                (SurveySubmission(**data.model_dump(exclude_unset=True))).model_dump(
                    exclude_unset=True
                )
            ),
        )
        submission = SurveySubmission.model_validate(
            humps.camelize(res_submission.json()[0])
        )
        answers_data = data.answers
        for answer in answers_data:
            answer.submissionId = submission.id
        # return submission
        res_answers = requests.post(
            endpoint_answers,
            headers=headers,
            json=humps.decamelize(
                [answer.model_dump(exclude_unset=True) for answer in answers_data]
            ),
        )
        # return humps.camelize(res_answers.json())
        answers = []
        for a in humps.camelize(res_answers.json()):
            answer = SubmittedAnswer(**a)
            answers.append(a)
        return_data = CompositeSubmission(**submission.model_dump(), answers=answers)
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    return return_data


@app.post("/surveyTemplate/{surveyTemplateId}/{surveyId}/calculate")
async def calculate_aspect_values(
    surveyTemplateId: str | int,
    surveyId: str | int,
    body: Optional[ServiceAspectCalculationInputBody] = None,
) -> ServiceAspectReadResult | ServiceAspectResultError:
    aspects = await read_query(
        "serviceAspectFormula",
        query=f"surveyTemplateId=eq.{surveyTemplateId}",
        fields="*,serviceAspect(title)",
    )
    formulas: list[ServiceAspectFormula] = []
    question_ids: set[str] = set([])
    for item in aspects["items"]:
        try:
            aspectFormula = ServiceAspectFormula(
                **item, serviceAspectTitle=item["serviceAspect"]["title"]
            )
        except ValidationError as e:
            return ServiceAspectResultError(errorMessage=str(e), errorDetails=e.json())
        aspectFormula.formula = bytes.fromhex(aspectFormula.formula).decode("utf-8")
        formulas.append(aspectFormula)
        question_ids = question_ids.union(extract_question_ids(aspectFormula.formula))
    question_answers = await read_query(
        "submittedAnswer",
        fields="id,templateQuestionId::int,value::real,templateQuestion!inner(answerFormat),surveySubmission!inner(surveyId)",
        query=f"templateQuestionId=in.({','.join(list(question_ids))})&templateQuestion.answerFormat=eq.number&surveySubmission.surveyId=eq.{surveyId}"
        + (
            f"&surveySubmission.tripId=in.({','.join(body.tripId)})"
            if body is not None and body.tripId is not None
            else ""
        )
        + (
            f"&surveySubmission.routeId=in.({','.join(body.routeId)})"
            if body is not None and body.routeId is not None
            else ""
        ),
    )
    answers: list[SubmittedAnswer] = []
    for answer in question_answers["items"]:
        try:
            parsed_answer = SubmittedAnswer(**answer)
            answers.append(parsed_answer)
        except ValidationError as e:
            return ServiceAspectResultError(errorMessage=str(e), errorDetails=e.json())
        except Exception as e:
            return ServiceAspectResultError(errorMessage=str(e))
    results: list[ServiceAspectResult] = []
    for formula in formulas:
        time_start = datetime.datetime.now()
        question_dict = create_answer_list_dict(answers)
        value = None
        try:
            value = evaluate(formula.formula, question_dict)
        except Exception as e:
            value = ServiceAspectResultError(errorMessage=str(e))
        finally:
            time_elapsed = datetime.datetime.now() - time_start
        results.append(
            ServiceAspectResult(
                formulaId=formula.id,
                serviceAspectId=formula.serviceAspectId,
                serviceAspectTitle=formula.serviceAspectTitle,
                value=value,
                questionIds=question_dict.keys(),
                calculationTime=time_elapsed.microseconds,
            )
        )
    try:
        final = ServiceAspectReadResult(
            totalSize=len(results), itemsStart=0, itemsEnd=len(results), items=results
        )
    except ValidationError as e:
        return ServiceAspectResultError(errorMessage=str(e), errorDetails=e.json())
    return final
