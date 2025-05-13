import requests
import os
import pandas as pd
import simplejson as json
import datetime

BASE_URL = "http://localhost:3000"
headers = {}


def getJsonValue(data: list | None) -> str | None:
    if type(data) == list:
        return json.dumps(data, ignore_nan=True, default=datetime.datetime.isoformat)


def insert(table: str, data: list, batch_size) -> int:
    if type(data) != list or len(data) <= 0:
        return 422
    do_upsert = os.getenv("DO_UPSERT", "false").lower() == "true"
    if do_upsert or True:
        headers["Prefer"] = "resolution=merge-duplicates"
    url = BASE_URL + "/" + table
    # Batch for big tables
    for i in range(0, len(data), batch_size):
        chunk = data[i : i + batch_size]
        chunk_data = getJsonValue(chunk)  # Convert chunk to JSON string
        res = requests.post(url, data=chunk_data, headers=headers)

    return res.status_code
