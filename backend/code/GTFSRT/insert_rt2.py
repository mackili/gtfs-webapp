import requests
import os
import pandas as pd
import simplejson as json
import datetime

headers = {}


def getJsonValue(data: list | None) -> str | None:
    if type(data) == list:
        return json.dumps(data, ignore_nan=True, default=datetime.datetime.isoformat)


def insert(table: str, data: list, batch_size: int, dbUrl: str) -> int:
    if type(data) != list or len(data) <= 0:
        return 422
    headers["Prefer"] = "resolution=merge-duplicates"
    url = dbUrl + "/" + table
    # Batch for big tables
    for i in range(0, len(data), batch_size):
        chunk = data[i : i + batch_size]
        chunk_data = getJsonValue(chunk)  # Convert chunk to JSON string
        try:
            res = requests.post(url, data=chunk_data, headers=headers)
            res.raise_for_status()
        except:
            print(res.status_code)

    return res.status_code
