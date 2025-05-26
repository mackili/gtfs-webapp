from google.protobuf.json_format import MessageToDict
import humps
import pandas as pd

PREFFERRED_LANGUAGE = "en"


def parse_alert2(data: list, entity_id: list):
    df = pd.DataFrame(list(data))
    df["oid"] = list(entity_id)
    informed_entities = []
    if "informedEntity" in df:
        informed_entities = parse_entity_selectors(df.pop("informedEntity"), df.oid)
    alert_dict = humps.decamelize(df.to_dict(orient="records"))
    return (
        pd.json_normalize(alert_dict, sep="_").to_dict(orient="records"),
        informed_entities,
    )


def parse_entity_selectors(data: pd.Series, parent_oid: list[str]) -> list[dict]:
    data.index = parent_oid
    data = humps.decamelize(data.dropna().to_dict())
    result = []
    for key in data.keys():
        rows_df = pd.DataFrame(data.get(key))
        rows_df["alert_id"] = key
        rows_df["oid"] = rows_df.astype(str).agg("".join, axis=1)
        result.extend(rows_df.to_dict(orient="records"))
    return result


def parse_stop_time_updates(data: pd.Series, parent_oid: list[str]) -> list[dict]:
    data.index = parent_oid
    data = humps.decamelize(data.dropna().to_dict())
    result = []
    for key in data.keys():
        rows_df = pd.DataFrame(data.get(key))
        rows_df["trip_update_id"] = key
        result.extend(rows_df.to_dict(orient="records"))
    return result


def parse_trip_update(data: list, entity_id: list):
    df = pd.DataFrame(list(data))
    df["oid"] = list(entity_id)
    stop_time_updates = []
    if "stopTimeUpdate" in df.columns:
        updates = parse_stop_time_updates(df.pop("stopTimeUpdate"), df.oid)
        if updates:
            stop_time_updates = pd.json_normalize(updates, sep="_")
            stop_time_updates["oid"] = (
                stop_time_updates["trip_id"]
                + stop_time_updates["stop_id"]
                + stop_time_updates["arrival_time"]
                + stop_time_updates["departure_time"]
            )
            stop_time_updates = stop_time_updates.drop(
                ["arrival", "departure"], axis=1
            ).to_dict(orient="records")

    trips_dict = humps.decamelize(df.to_dict(orient="records"))
    trips_df = pd.json_normalize(trips_dict, sep="_")
    trips_df.columns = trips_df.columns.str.replace("trip_", "")
    trips_df["timestamp"] = pd.to_datetime(trips_df["timestamp"], unit="s")
    return (
        trips_df.rename(columns={"id": "trip_id"}).to_dict(orient="records"),
        stop_time_updates,
    )


def parse_vehicle_position(data: list, entity_id: list):
    df = pd.json_normalize(humps.decamelize(list(data)), sep="_")
    df["oid"] = list(entity_id)
    return df.to_dict(orient="records")
