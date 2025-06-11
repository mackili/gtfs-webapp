from classes import *
import requests
from fastapi import HTTPException
import humps
import json
from pydantic.json import pydantic_encoder
from pydantic import BaseModel, field_validator, TypeAdapter

SURVEY_TEMPLATE_TABLE = "survey_template"
AUTHOR_TABLE = "author"
TEMPLATE_AUTHOR_TABLE = "survey_template_author"
TEMPLATE_SECTION_TABLE = "template_section"
TEMPLATE_QUESTION_TABLE = "template_question"
HEADERS = {"Prefer": "return=representation,resolution=merge-duplicates"}


async def request(endpoint, data, expected_codes: list[int]):
    try:
        res = requests.post(endpoint, headers=HEADERS, json=humps.decamelize(data))
        resJson = humps.camelize(res.json())
    except requests.exceptions.JSONDecodeError:
        raise HTTPException(status_code=res.status_code, detail=res.reason)
    if res.status_code not in expected_codes:
        raise HTTPException(status_code=res.status_code, detail=res.json())
    return resJson


async def delete(
    url: str, table: str, identifiers: dict[str, str | int | list[str | int]]
) -> None:
    endpoint = f"{url}/{table}?"
    for field in identifiers.keys():
        id = identifiers.get(field)
        if isinstance(id, str):
            endpoint += f"&{humps.decamelize(field)}=eq.{id}"
        if isinstance(id, int):
            endpoint += f"&{humps.decamelize(field)}=eq.{str(id)}"
        if isinstance(id, list):
            endpoint += f"&{humps.decamelize(field)}=in.({','.join('' if v is None else str(v) for v in id)})"
    res = requests.delete(endpoint)
    return


async def UpsertSurveyTemplate(data: TemplateSummary, url: str) -> SurveyTemplate:
    endpoint = f"{url}/{SURVEY_TEMPLATE_TABLE}"
    template = SurveyTemplate(
        id=data.id,
        title=data.title,
        displayTitle=data.displayTitle,
        description=data.description,
        type=data.type,
    )
    try:
        res = requests.post(
            endpoint, headers=HEADERS, data=humps.decamelize(template.model_dump())
        )
        resJson = humps.camelize(res.json())
    except requests.exceptions.JSONDecodeError:
        raise HTTPException(status_code=res.status_code, detail=res.reason)
    return SurveyTemplate.model_validate(resJson[0])


async def UpsertAuthor(data: TemplateSummary, url: str) -> list[Author]:
    endpoint = f"{url}/{AUTHOR_TABLE}"
    if data.surveyTemplateAuthors == None:
        return [Author()]
    authors_update = []
    authors_insert = []
    for author in data.surveyTemplateAuthors:
        if author.id != None:
            authors_update.append(author.model_dump(exclude_unset=True))
        else:
            authors_insert.append(author.model_dump(exclude_unset=True))
    try:
        res = requests.post(
            endpoint, headers=HEADERS, json=humps.decamelize(authors_update)
        )
        resJson: list[dict] = res.json()
        res = requests.post(
            endpoint, headers=HEADERS, json=humps.decamelize(authors_insert)
        )
        resJson = resJson + res.json()
    except requests.exceptions.JSONDecodeError:
        raise HTTPException(status_code=res.status_code, detail=res.reason)
    return [Author(**au) for au in humps.camelize(resJson)]


async def AssignAuthors(url: str, authors: list[Author], template: SurveyTemplate):
    if template.id == None:
        raise HTTPException(status_code=400, detail=f"Missing Template Id for Authors")

    endpoint = f"{url}/{TEMPLATE_AUTHOR_TABLE}"
    template_authors: list[dict] = []
    i = 0
    for author in authors:
        if author.id == None:
            raise HTTPException(status_code=400, detail=f"Missing for AuthorId")
        template_authors.append(
            SurveyTemplateAuthor(
                authorId=author.id, surveyTemplateId=template.id, displayOrder=i
            ).model_dump()
        )
        i += 1
    try:
        res = requests.post(
            endpoint, headers=HEADERS, json=humps.decamelize(template_authors)
        )
        resJson = res.json()
    except requests.exceptions.JSONDecodeError:
        raise HTTPException(status_code=res.status_code, detail=res.reason)
    return resJson


async def UpsertTemplateSection(
    data: TemplateSummary, url: str, templateId: int | str | None
) -> list[TemplateSection]:
    endpoint = f"{url}/{TEMPLATE_SECTION_TABLE}"
    if templateId == None:
        raise HTTPException(status_code=400, detail=f"Sections missing TemplateId")
    if data.templateSections == None:
        return []
    sections_insert = []
    sections_update = []
    for section in data.templateSections:
        section.surveyTemplateId = templateId
        if section.id == None:
            sections_insert.append(section.model_dump(exclude_unset=True))
        else:
            sections_update.append(section.model_dump(exclude_unset=True))

    resJson_update = await request(endpoint, sections_update, [200, 201])
    resJson_insert = await request(endpoint, sections_insert, [200, 201])
    return [
        TemplateSection(**se) for se in humps.camelize(resJson_insert + resJson_update)
    ]


# TODO: Add support for template section assignment
async def UpsertTemplateQuestions(
    data: TemplateSummary, url: str, templateId: int | str | None
) -> list[TemplateQuestion]:
    endpoint = f"{url}/{TEMPLATE_QUESTION_TABLE}"
    if templateId == None:
        raise HTTPException(status_code=400, detail=f"Questions missing TemplateId")
    if data.templateQuestions == None:
        return []
    questions_insert = []
    questions_update = []
    for question in data.templateQuestions:
        question.surveyTemplateId = templateId
        if not isinstance(question.templateSectionId, int):
            question.templateSectionId = None
        if question.id == None:
            questions_insert.append(question.model_dump(exclude_unset=True))
        else:
            questions_update.append(question.model_dump(exclude_unset=True))
    resJson_insert = await request(endpoint, questions_insert, [200, 201])
    resJson_update = await request(endpoint, questions_update, [200, 201])
    return [
        TemplateQuestion(**se) for se in humps.camelize(resJson_insert + resJson_update)
    ]


async def rollback(data: TemplateSummary, url: str):
    if data.id != None:
        if data.surveyTemplateAuthors != None and len(data.surveyTemplateAuthors) > 0:
            ids = []
            for author in data.surveyTemplateAuthors:
                if author.id != None:
                    ids.append(author.id)
            await delete(
                url,
                TEMPLATE_AUTHOR_TABLE,
                {"authorId": ids, "surveyTemplateId": data.id},
            )
            await delete(url, AUTHOR_TABLE, {"id": ids})
        if data.templateSections != None and len(data.templateSections) > 0:
            for section in data.templateSections:
                ids = []
                if section.id != None:
                    ids.append(section.id)
                await delete(url, TEMPLATE_SECTION_TABLE, {"id": ids})
        if data.templateQuestions != None and len(data.templateQuestions) > 0:
            for question in data.templateQuestions:
                ids = []
                if question.id != None:
                    ids.append(question.id)
                await delete(url, TEMPLATE_QUESTION_TABLE, {"id": ids})
        await delete(url, SURVEY_TEMPLATE_TABLE, {"id": data.id})
