# from unzip import *
from .validate import validate
from .insert import insert
import pandas as pd
from .utils import unzip

INCLUDE_SHAPES = True
BATCH_SIZE = 5000


async def importGTFS(
    binary: bytes, batch_size: int = BATCH_SIZE, include_shapes: bool = INCLUDE_SHAPES
):
    data = unzip(binary_data=binary)
    data = validate(data, include_shapes)

    insert("calendar", data.get("calendar.txt"), batch_size)
    insert("calendar_dates", data.get("calendar_dates.txt"), batch_size)
    insert("agency", data.get("agency.txt"), batch_size)
    insert("stops", data.get("stops.txt"), batch_size)
    insert("routes", data.get("routes.txt"), batch_size)
    if include_shapes:
        insert("shapes", data.get("shapes.txt"), batch_size)
    insert("trips", data.get("trips.txt"), batch_size)
    insert("frequencies", data.get("frequencies.txt"), batch_size)
    insert("stop_times", data.get("stop_times.txt"), batch_size)
