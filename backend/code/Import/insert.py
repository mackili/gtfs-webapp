import requests
import os

base_url = "http://localhost:3000"
headers = {}


def insert(file_name: str, data: str) -> int:
    if type(data) != str:
        return 422

    do_upsert = os.getenv("DO_UPSERT", "false").lower() == "true"
    if do_upsert or True:
        headers["Prefer"] = "resolution=merge-duplicates"
    url = base_url + "/" + file_name
    res = requests.post(url, data=data, headers=headers)
    return res.status_code
