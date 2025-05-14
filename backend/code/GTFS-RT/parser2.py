from google.protobuf.json_format import MessageToDict
import humps
import pandas as pd

PREFFERRED_LANGUAGE = "en"


def parse_alert2(data: list, entity_id: list):
    df = pd.DataFrame(list(data))
    df["oid"] = list(entity_id)
    informed_entities = []
    if "informedEntity" in df:
        informed_entities = parse_children(df.pop("informedEntity"), df.oid)
    alert_dict = humps.decamelize(df.to_dict(orient="records"))
    return (
        pd.json_normalize(alert_dict, sep="_").to_dict(orient="records"),
        informed_entities,
    )


def parse_children(data: pd.Series, parent_oid: list[str]) -> list[dict]:
    data.index = parent_oid
    data = data.dropna()
    decamelized = {key: humps.decamelize(val) for key, val in data.items()}
    frames = [
        pd.DataFrame(child_data).assign(alert_id=key)
        for key, child_data in decamelized.items()
        if child_data  # ensuring non-empty list/dict
    ]
    if frames:
        return pd.concat(frames, ignore_index=True).to_dict(orient="records")
    return []


def parse_trip_update(data: list, entity_id: list):
    df = pd.DataFrame(list(data))
    df["oid"] = list(entity_id)
    stop_time_updates = []
    if "stopTimeUpdate" in df.columns:
        updates = parse_children(df.pop("stopTimeUpdate"), df.oid)
        if updates:
            stop_time_updates = pd.json_normalize(updates, sep="_").to_dict(
                orient="records"
            )

    trips_dict = humps.decamelize(df.to_dict(orient="records"))
    trips_df = pd.json_normalize(trips_dict, sep="_")
    trips_df.columns = trips_df.columns.str.replace("trip_", "")
    return trips_df.to_dict(orient="records"), stop_time_updates


def parse_vehicle_position(data: list, entity_id: list):
    df = pd.json_normalize(humps.decamelize(list(data)), sep="_")
    df["oid"] = list(entity_id)
    return df.to_dict(orient="records")
