from google.transit import gtfs_realtime_pb2
from dateutil.parser import parse
from datetime import datetime


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
