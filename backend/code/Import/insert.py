import requests
import os
import pandas as pd

base_url = "http://localhost:3000"
headers = {}


def getJsonValue(data) -> str | None:
    if type(data) == pd.DataFrame:
        return data.to_json(orient="records")


def insert(file_name: str, data: list, batch_size: int) -> int:
    if type(data) != None:
        return 422
    do_upsert = os.getenv("DO_UPSERT", "false").lower() == "true"
    if do_upsert or True:
        headers["Prefer"] = "resolution=merge-duplicates"
    url = base_url + "/" + file_name
    # Batch for big tables
    for i in range(0, len(data), batch_size):
        chunk = data[i : i + batch_size]
        chunk_data = getJsonValue(chunk)  # Convert chunk to JSON string
        res = requests.post(url, data=chunk_data, headers=headers)

    return res.status_code
