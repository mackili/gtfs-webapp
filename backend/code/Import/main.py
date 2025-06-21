# from unzip import *
from .validate import validate
from .insert import insert
import pandas as pd
from .utils import unzip
from requests import exceptions

INCLUDE_SHAPES = True


async def importGTFS(
    binary: bytes, batch_size: int, include_shapes: bool = INCLUDE_SHAPES
):
    data = unzip(binary_data=binary)
    data = validate(data, include_shapes)

    # return data.get("stops.txt").to_json(orient="records")
    # return data.get("stop_times.txt").to_json(orient="records")
    try:
        insert("calendar", data.get("calendar.txt"), batch_size)
        # return data.get("calendar.txt").to_json(orient="records")
        insert("calendar_dates", data.get("calendar_dates.txt"), batch_size)
        # return data.get("calendar_dates.txt").to_json(orient="records")
        insert("agency", data.get("agency.txt"), batch_size)
        parent_stops = data.get("stops.txt").query(
            "parent_station.isnull()", engine="python"
        )
        # return parent_stops.to_json(orient="records")
        child_stops = data.get("stops.txt").query(
            "parent_station.notnull()", engine="python"
        )
        # return child_stops.to_json(orient="records")
        insert("stops", parent_stops, batch_size)
        insert("stops", child_stops, batch_size)
        insert("routes", data.get("routes.txt"), batch_size)
        if include_shapes:
            insert("shapes", data.get("shapes.txt"), batch_size)
        # return data.get("trips.txt").to_json(orient="records")
        insert("trips", data.get("trips.txt"), batch_size)
        insert("frequencies", data.get("frequencies.txt"), batch_size)
        insert("stop_times", data.get("stop_times.txt"), batch_size)
    except exceptions.HTTPError as e:
        raise e
