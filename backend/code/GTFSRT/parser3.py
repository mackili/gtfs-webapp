from __future__ import annotations
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from classes_rt import (
    VehiclePositionDB,
    TripUpdateDBRow,
    StopTimeUpdateDBRow,
    AlertDBRow,
    EntitySelectorDBRow,
    FeedEntity,
    TransformFeedResult,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _ts(t: Optional[int]) -> Optional[datetime]:
    """Convert POSIX seconds to UTC datetime (or None)."""
    return None if t is None else datetime.fromtimestamp(t, tz=timezone.utc)


# ---------------------------------------------------------------------------
# Extractors
# ---------------------------------------------------------------------------


def _vehicle_positions(entities: List[FeedEntity]) -> List[VehiclePositionDB]:
    rows: List[VehiclePositionDB] = []
    for ent in entities:
        if not ent.vehicle:
            continue
        vp, trip, veh, pos = (
            ent.vehicle,
            ent.vehicle.trip,
            ent.vehicle.vehicle,
            ent.vehicle.position,
        )
        rows.append(
            VehiclePositionDB(
                oid=ent.id,  # producer-supplied key
                trip_trip_id=trip.tripId if trip else None,
                trip_route_id=trip.routeId if trip else None,
                trip_start_time=trip.startTime if trip else None,
                trip_start_date=trip.startDate if trip else None,
                stop_id=vp.stopId,
                vehicle_id=veh.id if veh else None,
                vehicle_label=veh.label if veh else None,
                position_latitude=pos.latitude if pos else None,
                position_longitude=pos.longitude if pos else None,
                position_earing=pos.bearing if pos else None,  # column typo kept
                position_speed=pos.speed if pos else None,
                occupancy_status=vp.occupancyStatus,
                current_stop_sequence=vp.currentStopSequence,
                current_status=vp.currentStatus,
                timestamp=_ts(vp.timestamp),
            )
        )
    return rows


def _trip_updates(
    entities: List[FeedEntity],
) -> Tuple[List[TripUpdateDBRow], List[StopTimeUpdateDBRow]]:
    trip_rows: List[TripUpdateDBRow] = []
    stu_rows: List[StopTimeUpdateDBRow] = []
    for ent in entities:
        if not ent.tripUpdate:
            continue
        tu, veh, trip = ent.tripUpdate, ent.tripUpdate.vehicle, ent.tripUpdate.trip

        # ---- parent row -----------------------------------------------------
        trip_rows.append(
            TripUpdateDBRow(
                oid=ent.id,  # <-- key comes straight from feed
                trip_id=trip.tripId,
                route_id=trip.routeId,
                start_time=trip.startTime,
                start_date=trip.startDate,
                schedule_relationship=trip.scheduleRelationship,
                vehicle_id=veh.id if veh else None,
                vehicle_label=veh.label if veh else None,
                vehicle_license_plate=veh.licensePlate if veh else None,
                delay=tu.delay,
                timestamp=_ts(tu.timestamp),
            )
        )

        # ---- child rows -----------------------------------------------------
        if tu.stopTimeUpdate:
            for idx, stu in enumerate(tu.stopTimeUpdate):
                arr, dep = stu.arrival, stu.departure
                stu_rows.append(
                    StopTimeUpdateDBRow(
                        oid=f"{ent.id}={idx}",  # nested key
                        stop_sequence=stu.stopSequence,
                        stop_id=stu.stopId,
                        arrival_delay=arr.delay if arr else None,
                        arrival_time=_ts(arr.time) if arr and arr.time else None,
                        arrival_uncertainty=arr.uncertainty if arr else None,
                        departure_delay=dep.delay if dep else None,
                        departure_time=_ts(dep.time) if dep and dep.time else None,
                        departure_uncertainty=dep.uncertainty if dep else None,
                        schedule_relationship=stu.scheduleRelationship,
                        trip_update_id=ent.id,  # FK
                    )
                )
    return trip_rows, stu_rows


def _alerts(
    entities: List[FeedEntity],
) -> Tuple[List[AlertDBRow], List[EntitySelectorDBRow]]:
    alert_rows: List[AlertDBRow] = []
    selector_rows: List[EntitySelectorDBRow] = []
    for ent in entities:
        if not ent.alert:
            continue
        al = ent.alert

        # ---- alert row ------------------------------------------------------
        alert_rows.append(
            AlertDBRow(
                oid=ent.id,
                active_period=[ap.dict() for ap in (al.activePeriod or [])],
                cause=al.cause,
                effect=al.effect,
                url=al.url.translation[0].text if al.url else None,
                header_text=al.headerText.translation[0].text,
                description_text=al.descriptionText.translation[0].text,
                severity_level=al.severityLevel,
                url_translation=(
                    [tr.dict() for tr in al.url.translation] if al.url else None
                ),
                header_text_translation=[tr.dict() for tr in al.headerText.translation],
                description_text_translation=[
                    tr.dict() for tr in al.descriptionText.translation
                ],
            )
        )

        # ---- informed_entity rows ------------------------------------------
        for idx, es in enumerate(al.informedEntity):
            trip = es.trip
            selector_rows.append(
                EntitySelectorDBRow(
                    oid=f"{ent.id}:{idx}",
                    agency_id=es.agencyId,
                    route_id=es.routeId,
                    stop_id=es.stopId,
                    route_type=(
                        int(es.routeType)
                        if es.routeType and es.routeType.isdigit()
                        else None
                    ),
                    trip_id=trip.tripId if trip else None,
                    trip_route_id=trip.routeId if trip else None,
                    trip_start_time=trip.startTime if trip else None,
                    trip_start_date=trip.startDate if trip else None,
                    alert_id=ent.id,  # FK
                )
            )
    return alert_rows, selector_rows


# ---------------------------------------------------------------------------
# Public façade
# ---------------------------------------------------------------------------


def transform_feed(feed_entities: List[FeedEntity]) -> TransformFeedResult:
    """
    Convert a GTFS-Realtime FeedMessage into plain Python lists keyed for UPSERTs.
    """
    vehicle_rows = _vehicle_positions(feed_entities)
    trip_rows, stu_rows = _trip_updates(feed_entities)
    alert_rows, selector_rows = _alerts(feed_entities)

    return TransformFeedResult(
        vehicle_positions=vehicle_rows,
        trip_updates=trip_rows,
        stop_time_updates=stu_rows,
        alerts=alert_rows,
        entity_selectors=selector_rows,
    )
