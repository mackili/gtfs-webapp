from fastapi import FastAPI
from typing import Union
from pydantic import BaseModel
import requests

app = FastAPI()

BASE_URL = "http://localhost:3000"


@app.get("/query")
def read_query(table: str, fields=None):
    endpoint = BASE_URL + "/" + table
    if fields != None:
        endpoint += "?select=" + fields
    res = requests.get(endpoint)
    return res.json()
