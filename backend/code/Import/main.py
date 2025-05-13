from unzip import *
from validate import validate
from insert import insert
import pandas as pd
from tqdm import tqdm

INCLUDE_SHAPES = True
BATCH_SIZE = 5000

with tqdm(total=11) as pbar:
    data = unzip("gtfs-webapp/backend/SEQ_GTFS.zip")
    pbar.update(1)
    data = validate(data, INCLUDE_SHAPES)
    pbar.update(1)

    insert("calendar", data.get("calendar.txt"), BATCH_SIZE)
    pbar.update(1)
    insert("calendar_dates", data.get("calendar_dates.txt"), BATCH_SIZE)
    pbar.update(1)
    insert("agency", data.get("agency.txt"), BATCH_SIZE)
    pbar.update(1)
    insert("stops", data.get("stops.txt"), BATCH_SIZE)
    pbar.update(1)
    insert("routes", data.get("routes.txt"), BATCH_SIZE)
    pbar.update(1)
    if INCLUDE_SHAPES:
        insert("shapes", data.get("shapes.txt"), BATCH_SIZE)
    pbar.update(1)
    insert("trips", data.get("trips.txt"), BATCH_SIZE)
    pbar.update(1)
    insert("frequencies", data.get("frequencies.txt"), BATCH_SIZE)
    pbar.update(1)
    insert("stop_times", data.get("stop_times.txt"), BATCH_SIZE)
    pbar.update(1)
    pbar.close()
