from fastapi import FastAPI, HTTPException
from typing import Union
import requests
import subprocess
import simplejson as json
from classes import *

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
    command = ["python3", "backend/code/GTFS-RT/main_rt.py"]
    if options.tripUpdates:
        command.extend(["-t", options.tripUpdates])
    if options.vehiclePositions:
        command.extend(["-p", options.vehiclePositions])
    if options.alerts:
        command.extend(["-a", options.alerts])
    if options.batchSize:
        command.extend(["-b", str(options.batchSize)])
    if options.verbose:
        command.extend(["-v", "True"])
    if options.write:
        command.extend(["-w", "True"])

    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        try:
            output_json = json.loads(result.stdout)  # Parse JSON output
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Failed to parse JSON from main.py",
                    "stdout": result.stdout,
                },
            )

        return {
            "stdout": output_json,  # Parsed JSON output
            "stderr": result.stderr,
        }
    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=500, detail={"stdout": e.stdout, "stderr": e.stderr}
        )
