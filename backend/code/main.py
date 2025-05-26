from fastapi import FastAPI, HTTPException
from typing import Union
import requests
import subprocess
import simplejson as json
from classes import *
import sys
from pydantic import ValidationError

sys.path.insert(1, "GTFSRT")
import main_rt as rt

app = FastAPI()

BASE_URL = "http://localhost:3000"


@app.get("/query")
def read_query(table: str, fields=None):
    endpoint = BASE_URL + "/" + table
    if fields != None:
        endpoint += "?select=" + fields
    res = requests.get(endpoint)
    return res.json()


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
