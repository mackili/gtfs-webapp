from classes import *
import requests
from fastapi import HTTPException
import humps
import json
from pydantic.json import pydantic_encoder
from pydantic import BaseModel, field_validator, TypeAdapter
from Surveys.upsert import (
    TEMPLATE_AUTHOR_TABLE,
    TEMPLATE_SECTION_TABLE,
    TEMPLATE_QUESTION_TABLE,
    HEADERS,
)

from Surveys.upsert import delete as delete_db


def diff_lists(list_one: list[str], list_two: list[str]) -> list[str]:
    res = []
    for id in list_two:
        if id not in list_one:
            res.append(id)
    return res


def dict_to_list_id(dictionary_list: list[dict] | dict, id_key: str = "id"):
    result = []
    if isinstance(dictionary_list, dict):
        result.append(dictionary_list[id_key])
    else:
        for item in dictionary_list:
            if isinstance(item, dict):
                result.append(item[id_key])
            else:
                result.append(getattr(item, id_key))
    return result


async def handle_delete_difference(
    data: list,
    table: str,
    url: str,
    headers,
    parent_id_filter: str,
    id_key: str | list[str] = "id",
):
    if humps.decamelize(table) in [
        TEMPLATE_AUTHOR_TABLE,
        TEMPLATE_SECTION_TABLE,
        TEMPLATE_QUESTION_TABLE,
    ]:
        id_list = dict_to_list_id(data)
        endpoint = (
            url
            + "/"
            + humps.decamelize(table)
            + humps.decamelize(f"?{parent_id_filter}")
            + f"&select={','.join( [id_key] if isinstance(id_key, str) else id_key)}"
        )
        # return endpoint
        data_db = requests.get(endpoint).json()
        # return data_db
        # return dict_to_list_id(data_db)
        diff = diff_lists(id_list, dict_to_list_id(data_db))
        if len(diff) > 0:
            return await delete_db(url, humps.decamelize(table), {"id": diff})
