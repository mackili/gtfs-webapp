from unzip import *
from validate import validate
from insert import insert
import pandas as pd
from tqdm import tqdm


def getJsonValue(table_name, data) -> str | None:
    data_subset = data.get(table_name)
    if type(data_subset) == pd.DataFrame:
        return data_subset.to_json(orient="records")


with tqdm(total=11) as pbar:
    data = unzip("gtfs-webapp/backend/GTFS_KŚ.zip")
    pbar.update(1)
    data = validate(data)
    pbar.update(1)

    insert("calendar", getJsonValue("calendar.txt", data))
    pbar.update(1)
    insert("calendar_dates", getJsonValue("calendar_dates.txt", data))
    pbar.update(1)
    insert("agency", getJsonValue("agency.txt", data))
    pbar.update(1)
    insert("stops", getJsonValue("stops.txt", data))
    pbar.update(1)
    insert("routes", getJsonValue("routes.txt", data))
    pbar.update(1)
    insert("shapes", getJsonValue("shapes.txt", data))
    pbar.update(1)
    insert("trips", getJsonValue("trips.txt", data))
    pbar.update(1)
    insert("frequencies", getJsonValue("frequencies.txt", data))
    pbar.update(1)
    insert("stop_times", getJsonValue("stop_times.txt", data))
    pbar.update(1)
