from unzip import *
from validate import validate
from insert import insert
import pandas as pd
from tqdm import tqdm
from datetime import datetime

START = datetime.now()

INCLUDE_SHAPES = True
BATCH_SIZE = 5000

with tqdm(total=11) as pbar:
    print(f"Started insert at {START}")
    data = unzip("gtfs-webapp/backend/SEQ_GTFS.zip")
    print(f"Data unzipped after {datetime.now()-START} seconds")
    pbar.update(1)
    data = validate(data, INCLUDE_SHAPES)
    print(f"Data validated after {datetime.now()-START} seconds")
    pbar.update(1)

    insert("calendar", data.get("calendar.txt"), BATCH_SIZE)
    print(f"Calendar inserted after {datetime.now()-START} seconds")
    pbar.update(1)
    insert("calendar_dates", data.get("calendar_dates.txt"), BATCH_SIZE)
    print(f"Calendar Dates inserted after {datetime.now()-START} seconds")
    pbar.update(1)
    insert("agency", data.get("agency.txt"), BATCH_SIZE)
    print(f"Agency inserted after {datetime.now()-START} seconds")
    pbar.update(1)
    insert("stops", data.get("stops.txt"), BATCH_SIZE)
    print(f"Stops inserted after {datetime.now()-START} seconds")
    pbar.update(1)
    insert("routes", data.get("routes.txt"), BATCH_SIZE)
    print(f"Routes inserted after {datetime.now()-START} seconds")
    pbar.update(1)
    if INCLUDE_SHAPES:
        insert("shapes", data.get("shapes.txt"), BATCH_SIZE)
        print(f"Shapes inserted after {datetime.now()-START} seconds")
    pbar.update(1)
    insert("trips", data.get("trips.txt"), BATCH_SIZE)
    print(f"Trips inserted after {datetime.now()-START} seconds")
    pbar.update(1)
    insert("frequencies", data.get("frequencies.txt"), BATCH_SIZE)
    print(f"Frequencies inserted after {datetime.now()-START} seconds")
    pbar.update(1)
    insert("stop_times", data.get("stop_times.txt"), BATCH_SIZE)
    print(f"Stop Times inserted after {datetime.now()-START} seconds")
    pbar.update(1)
    pbar.close()
    print(f"Complete after {datetime.now()-START} seconds")
