from google.transit import gtfs_realtime_pb2
from dateutil.parser import parse
from datetime import datetime

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
    parsed_trip = {
        "oid": oid,
        "trip_id": data.trip.trip_id,
        "route_id": data.trip.route_id,
        "trip_start_time": data.trip.start_time,
        "trip_start_date": parse(data.trip.start_date).date().isoformat(),
        "schedule_relationship": data.trip.DESCRIPTOR.enum_types_by_name[
            "ScheduleRelationship"
        ]
        .values_by_number[data.trip.schedule_relationship]
        .name,
        "vehicle_id": data.vehicle.id,
        "vehicle_label": data.vehicle.label,
        "vehicle_license_plate": data.vehicle.license_plate,
        "timestamp": timestamp,
        "delay": data.delay,
    }
    return (parsed_trip, parse_stop_time_updates(data.stop_time_update, oid))


def parse_stop_time_updates(data, parent_oid) -> list:
    result = []
    for update in data:
        result.append(
            {
                "oid": parent_oid + update.stop_id,
                "stop_sequence": update.stop_sequence,
                "stop_id": update.stop_id,
                "arrival_time": update.arrival.time,
                "arrival_delay": update.arrival.delay,
                "arrival_uncertainty": update.arrival.uncertainty,
                "departure_time": update.departure.time,
                "departure_delay": update.departure.delay,
                "departure_uncertainty": update.departure.uncertainty,
                "schedule_relationship": update.DESCRIPTOR.enum_types_by_name[
                    "ScheduleRelationship"
                ]
                .values_by_number[update.schedule_relationship]
                .name,
                "trip_update_id": parent_oid,
            }
        )
    return result


def parse_vehicle_position(data) -> dict:
    timestamp = datetime.fromtimestamp(data.timestamp).isoformat()
    oid = data.vehicle.id + data.trip.trip_id + timestamp
    parsed_vehicle_position = {
        "oid": oid,
        "trip_id": data.trip.trip_id,
        "route_id": data.trip.route_id,
        "trip_start_time": data.trip.start_time,
        "trip_start_date": data.trip.start_date,
        "vehicle_id": data.vehicle.id,
        "vehicle_label": data.vehicle.label,
        "position_latitude": data.position.latitude,
        "position_longitude": data.position.longitude,
        "position_speed": data.position.speed,
        "occupancy_status": data.DESCRIPTOR.enum_types_by_name["OccupancyStatus"]
        .values_by_number[data.occupancy_status]
        .name,
        "current_stop_sequence": data.current_stop_sequence,
        "timestamp": timestamp,
    }
    return parsed_vehicle_position


def parse_alert(data, entity_id) -> tuple[dict, list]:
    oid = entity_id
    parsed_alert = {
        "oid": oid,
        "start": data.active_period[0].start,
        "end": data.active_period[0].end,
        "cause": data.DESCRIPTOR.enum_types_by_name["Cause"]
        .values_by_number[data.cause]
        .name,
        "effect": data.DESCRIPTOR.enum_types_by_name["Effect"]
        .values_by_number[data.effect]
        .name,
        "url": getTrans(data.url),
        "header_text": getTrans(data.header_text),
        "description_text": getTrans(data.description_text),
        "severity_level": data.DESCRIPTOR.enum_types_by_name["SeverityLevel"]
        .values_by_number[data.severity_level]
        .name,
    }
    return parsed_alert, parse_entity_selectors(data.informed_entity, oid)


def parse_entity_selectors(data, parent_oid) -> list:
    parsed_entities = []
    i: int = 0
    for entity in data:
        parsed_entities.append(
            {
                "oid": parent_oid + str(i),
                "alert_id": parent_oid,
                "agency_id": entity.agency_id if entity.agency_id != "" else None,
                "stop_id": entity.stop_id if entity.stop_id != "" else None,
                "route_id": entity.route_id if entity.route_id != "" else None,
                "route_type": entity.route_type,
                "trip_id": entity.trip.trip_id if entity.trip.trip_id != "" else None,
                "trip_route_id": (
                    entity.trip.route_id if entity.trip.route_id != "" else None
                ),
                "trip_start_time": entity.trip.start_time,
                "trip_start_date": entity.trip.start_date,
            }
        )
        i = i + 1
    return parsed_entities
