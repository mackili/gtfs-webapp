from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime


class TripDescriptor(BaseModel):
    # Trip id is required
    tripId: str
    routeId: Optional[str] = None  # Optional hence tripId is required
    startTime: Optional[str] = None
    startDate: Optional[str] = None
    scheduleRelationship: Optional[str] = None


class VehicleDescriptor(BaseModel):
    id: Optional[str] = None
    label: Optional[str] = None
    licensePlate: Optional[str] = None
    wheelchairAccessible: Optional[str] = None


class StopTimeEvent(BaseModel):
    delay: Optional[int] = None
    time: Optional[int] = None
    scheduledTime: Optional[int] = None
    uncertainty: Optional[int] = None


class StopTimeUpdate(BaseModel):
    stopSequence: Optional[int] = None
    stopId: Optional[str] = None
    arrival: Optional[StopTimeEvent] = None
    departure: Optional[StopTimeEvent] = None
    scheduleRelationship: Optional[str] = None


class TripUpdate(BaseModel):
    trip: TripDescriptor
    vehicle: Optional[VehicleDescriptor] = None
    stopTimeUpdate: Optional[List[StopTimeUpdate]] = None
    timestamp: Optional[int] = None
    delay: Optional[int] = None


class Position(BaseModel):
    latitude: float
    longitude: float
    bearing: Optional[float] = None
    speed: Optional[float] = None


class VehiclePosition(BaseModel):
    trip: Optional[TripDescriptor] = None
    vehicle: Optional[VehicleDescriptor] = None
    position: Optional[Position] = None
    currentStopSequence: Optional[int] = None
    stopId: Optional[str] = None
    currentStatus: Optional[str] = None
    timestamp: Optional[int] = None
    occupancyStatus: Optional[str] = None


class Translation(BaseModel):
    text: str
    language: Optional[str] = None


class TranslatedString(BaseModel):
    translation: List[Translation]


class TimeRange(BaseModel):
    start: Optional[int] = None
    end: Optional[int] = None


class EntitySelector(BaseModel):
    agencyId: Optional[str] = None
    routeId: Optional[str] = None
    routeType: Optional[str] = None
    trip: Optional[TripDescriptor] = None
    stopId: Optional[str] = None


class Alert(BaseModel):
    activePeriod: Optional[List[TimeRange]] = None
    informedEntity: List[EntitySelector]
    cause: Optional[str] = None
    effect: Optional[str] = None
    url: Optional[TranslatedString] = None
    headerText: TranslatedString
    descriptionText: TranslatedString
    severityLevel: Optional[str] = None


class FeedEntity(BaseModel):
    id: str
    tripUpdate: Optional[TripUpdate] = None
    vehicle: Optional[VehiclePosition] = None
    alert: Optional[Alert] = None


class FeedHeader(BaseModel):
    gtfsRealtimeVersion: Literal["2.0"]
    incrementality: str
    timestamp: int


class FeedMessage(BaseModel):
    header: FeedHeader
    entity: List[FeedEntity]


# ────────────────────────────────────────────────────────────────────────────
# 1. vehicle_positions
# ────────────────────────────────────────────────────────────────────────────
class VehiclePositionDB(BaseModel):
    oid: str
    trip_trip_id: Optional[str] = None
    trip_route_id: Optional[str] = None
    trip_start_time: Optional[str] = None  # “HH:MM:SS”
    trip_start_date: Optional[str] = None  # “YYYYMMDD”
    stop_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    vehicle_label: Optional[str] = None
    position_latitude: Optional[float] = None
    position_longitude: Optional[float] = None
    position_earing: Optional[float] = Field(  # column name typo kept!
        default=None, alias="position_earing"
    )
    position_speed: Optional[float] = None
    occupancy_status: Optional[str] = None
    current_stop_sequence: Optional[int] = None
    current_status: Optional[str] = None
    timestamp: Optional[datetime] = None

    model_config = {"populate_by_name": True, "from_attributes": True}


# ────────────────────────────────────────────────────────────────────────────
# 2. trip_updates
# ────────────────────────────────────────────────────────────────────────────
class TripUpdateDBRow(BaseModel):
    oid: str
    trip_id: str
    route_id: Optional[str] = None
    start_time: Optional[str] = None
    start_date: Optional[str] = None
    schedule_relationship: Optional[str] = None
    vehicle_id: Optional[str] = None
    vehicle_label: Optional[str] = None
    vehicle_license_plate: Optional[str] = None
    delay: Optional[int] = None
    timestamp: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ────────────────────────────────────────────────────────────────────────────
# 3. stop_time_updates
# ────────────────────────────────────────────────────────────────────────────
class StopTimeUpdateDBRow(BaseModel):
    oid: str
    stop_sequence: Optional[int] = None
    stop_id: Optional[str] = None
    arrival_delay: Optional[float] = None
    arrival_time: Optional[datetime] = None
    arrival_uncertainty: Optional[float] = None
    departure_delay: Optional[float] = None
    departure_time: Optional[datetime] = None
    departure_uncertainty: Optional[float] = None
    schedule_relationship: Optional[str] = None
    trip_update_id: str

    model_config = {"from_attributes": True}


# ────────────────────────────────────────────────────────────────────────────
# 4. alerts
# ────────────────────────────────────────────────────────────────────────────
class AlertDBRow(BaseModel):
    oid: str
    active_period: Optional[List[Dict[str, Any]]] = None  # stored as JSON
    cause: Optional[str] = None
    effect: Optional[str] = None
    url: Optional[str] = None
    header_text: str
    description_text: str
    severity_level: Optional[str] = None
    url_translation: Optional[List[Dict[str, Any]]] = None
    header_text_translation: List[Dict[str, Any]]
    description_text_translation: List[Dict[str, Any]]

    model_config = {"from_attributes": True}


# ────────────────────────────────────────────────────────────────────────────
# 5. entity_selectors
# ────────────────────────────────────────────────────────────────────────────
class EntitySelectorDBRow(BaseModel):
    oid: str
    agency_id: Optional[str] = None
    route_id: Optional[str] = None
    stop_id: Optional[str] = None
    route_type: Optional[int] = None
    trip_id: Optional[str] = None
    trip_route_id: Optional[str] = None
    trip_start_time: Optional[str] = None
    trip_start_date: Optional[str] = None
    alert_id: str

    model_config = {"from_attributes": True}


class TransformFeedResult(BaseModel):
    vehicle_positions: List[VehiclePositionDB]
    trip_updates: List[TripUpdateDBRow]
    stop_time_updates: List[StopTimeUpdateDBRow]
    alerts: List[AlertDBRow]
    entity_selectors: List[EntitySelectorDBRow]
