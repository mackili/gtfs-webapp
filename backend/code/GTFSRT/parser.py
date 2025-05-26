from google.transit import gtfs_realtime_pb2
from dateutil.parser import parse
from datetime import datetime
from google.protobuf.json_format import MessageToDict
import humps
import pandas as pd

PREFFERRED_LANGUAGE = "en"


def getTrans(string):
    """Get a specific translation from a TranslatedString."""
    # If we don't find the requested language, return this
    untranslated = None

    # single translation, return it
    if len(string.translation) == 1:
        return string.translation[0].text

    for t in string.translation:
        if t.language == PREFFERRED_LANGUAGE:
            return t.text
        if t.language is None:
            untranslated = t.text
    return untranslated


def parse_trip(data) -> tuple[dict, list]:
    timestamp = datetime.fromtimestamp(data.timestamp).isoformat()
    oid = data.trip.trip_id + timestamp
    parsed_trip = humps.decamelize(MessageToDict(data.trip))
    parsed_trip["oid"] = oid
    return (
        parsed_trip,
        parse_stop_time_updates(MessageToDict(data)["stopTimeUpdate"], oid),
    )


def parse_stop_time_updates(data, parent_oid) -> list:
    result = humps.decamelize(data)
    for item in result:
        item["oid"] = parent_oid + item["stop_id"]
    result_df = pd.json_normalize(result, sep="_")
    result_df["arrival_time"] = pd.to_datetime(
        result_df["arrival_time"], unit="s", errors="coerce"
    )
    result_df["departure_time"] = pd.to_datetime(
        result_df["departure_time"], unit="s", errors="coerce"
    )
    return result_df.to_dict(orient="records")


def parse_vehicle_position(data) -> dict:
    parsed_vehicle_position = humps.decamelize(MessageToDict(data))
    oid = (
        parsed_vehicle_position["vehicle"]["id"]
        + parsed_vehicle_position["trip"]["trip_id"]
        + parsed_vehicle_position["timestamp"]
    )
    parsed_vehicle_position["oid"] = oid
    parsed_vehicle_position["timestamp"] = datetime.isoformat(
        datetime.fromtimestamp(data.timestamp), sep="T"
    )
    return pd.json_normalize(parsed_vehicle_position, sep="_").to_dict(
        orient="records"
    )[0]


def parse_alert(data, entity_id) -> tuple[dict, list]:
    oid = entity_id
    # parsed_alert = {
    #     "oid": oid,
    #     "start": data.active_period[0].start,
    #     "end": data.active_period[0].end,
    #     "cause": data.DESCRIPTOR.enum_types_by_name["Cause"]
    #     .values_by_number[data.cause]
    #     .name,
    #     "effect": data.DESCRIPTOR.enum_types_by_name["Effect"]
    #     .values_by_number[data.effect]
    #     .name,
    #     "url": getTrans(data.url),
    #     "header_text": getTrans(data.header_text),
    #     "description_text": getTrans(data.description_text),
    #     "severity_level": data.DESCRIPTOR.enum_types_by_name["SeverityLevel"]
    #     .values_by_number[data.severity_level]
    #     .name,
    # }
    parsed_alert = humps.decamelize(MessageToDict(data))
    parsed_alert["oid"] = oid
    if "informed_entity" in parsed_alert.keys():
        parsed_inform = parse_entity_selectors(parsed_alert.pop("informed_entity"), oid)
    else:
        parsed_inform = []
    return (
        pd.json_normalize(parsed_alert, sep="_").to_dict(orient="records")[0],
        parsed_inform,
    )


def parse_entity_selectors(data, parent_oid) -> list:
    i: int = 0
    for entity in data:
        entity["oid"] = parent_oid + str(i)
        i = i + 1
    return data
