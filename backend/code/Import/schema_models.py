from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VehiclePositions(BaseModel):
    oid: Optional[str]
    trip_id: Optional[str]
    route_id: Optional[str]
    position_speed: Optional[float]
    vehicle_label: Optional[str]
    occupancy_status: Optional[str]
    position_latitude: Optional[float]
    trip_start_date: Optional[str]
    trip_start_time: Optional[str]
    vehicle_id: Optional[str]
    position_longitude: Optional[float]
    position_earing: Optional[float]


class EntitySelectors(BaseModel):
    oid: Optional[str]
    alert_id: Optional[str]
    agency_id: Optional[str]
    route_id: Optional[str]
    stop_id: Optional[str]
    trip_id: Optional[str]
    trip_route_id: Optional[str]
    trip_start_date: Optional[str]
    trip_start_time: Optional[str]
    route_type: Optional[str]


class Shapes(BaseModel):
    shape_pt_sequence: Optional[int]
    shape_id: str
    shape_pt_lat_lon: Optional[str]
    shape_dist_traveled: Optional[float]


class Routes(BaseModel):
    route_id: Optional[str]
    agency_id: Optional[str]
    continous_pickup: Optional[str]
    route_sort_order: Optional[int]
    route_color: Optional[str]
    route_short_name: Optional[str]
    route_long_name: Optional[str]
    route_text_color: Optional[str]
    continous_drop_off: Optional[str]
    route_type: Optional[str]
    route_url: Optional[str]
    route_desc: Optional[str]
    network_id: Optional[str]


class Agency(BaseModel):
    agency_id: Optional[str]
    agency_phone: Optional[str]
    agency_timezone: Optional[str]
    agency_fare_url: Optional[str]
    agency_lang: Optional[str]
    agency_url: Optional[str]
    agency_name: Optional[str]
    agency_email: Optional[str]


class Trips(BaseModel):
    trip_id: Optional[str]
    route_id: Optional[str]
    shape_id: Optional[str]
    service_id: Optional[str]
    trip_short_name: Optional[str]
    trip_headsign: Optional[str]
    block_id: Optional[str]
    wheelchair_accessible: Optional[str]
    bikes_allowed: Optional[str]
    direction_id: Optional[str]


class Calendar(BaseModel):
    service_id: Optional[str]
    friday: Optional[bool]
    stard_date: Optional[datetime]
    thursday: Optional[bool]
    end_date: Optional[datetime]
    saturday: Optional[bool]
    tuesday: Optional[bool]
    wednesday: Optional[bool]
    monday: Optional[bool]
    sunday: Optional[bool]


class CalendarDates(BaseModel):
    date: Optional[datetime]
    service_id: Optional[str]
    service_id: Optional[str]
    exception_type: Optional[str]


class Frequencies(BaseModel):
    trip_id: Optional[str]
    trip_id: Optional[str]
    headway_secs: Optional[int]
    end_time: Optional[str]
    start_time: Optional[str]
    exact_times: Optional[int]


class Stops(BaseModel):
    stop_id: Optional[str]
    parent_station: Optional[str]
    platform_code: Optional[str]
    stop_lat_lon: Optional[str]
    level_id: Optional[str]
    tts_stop_name: Optional[str]
    zone_id: Optional[str]
    stop_desc: Optional[str]
    stop_code: Optional[str]
    location_type: Optional[str]
    stop_url: Optional[str]
    stop_name: Optional[str]
    wheelchair_boarding: Optional[str]
    stop_timezone: Optional[str]


class StopTimes(BaseModel):
    stop_sequence: Optional[int]
    trip_id: Optional[str]
    trip_id: Optional[str]
    stop_id: Optional[str]
    end_pickup_drop_off_window: Optional[str]
    pickup_type: Optional[str]
    departure_time: Optional[str]
    arrival_time: Optional[str]
    location_id: Optional[str]
    drop_off_type: Optional[str]
    pickup_booking_rule_id: Optional[str]
    continous_pickup: Optional[str]
    location_group_id: Optional[str]
    shape_dist_traveled: Optional[float]
    start_pickup_drop_off_window: Optional[str]
    stop_headsign: Optional[str]
    drop_off_booking_rule_id: Optional[str]
    timepoint: Optional[str]
    continous_drop_off: Optional[str]


class StopTimeUpdates(BaseModel):
    oid: Optional[str]
    stop_id: Optional[str]
    trip_update_id: Optional[str]
    arrival_delay: Optional[int]
    departure_delay: Optional[int]
    arrival_uncertainty: Optional[int]
    schedule_relationship: Optional[str]
    departure_time: Optional[int]
    stop_sequence: Optional[int]
    arrival_time: Optional[int]
    departure_uncertainty: Optional[int]


class TripUpdates(BaseModel):
    oid: Optional[str]
    trip_id: Optional[str]
    vehicle_id: Optional[str]
    schedule_relationship: Optional[str]
    route_id: Optional[str]
    vehicle_label: Optional[str]
    trip_start_time: Optional[str]
    trip_start_date: Optional[str]
    timestamp: Optional[datetime]
    vehicle_license_plate: Optional[str]


class Alerts(BaseModel):
    oid: Optional[str]
    oid: Optional[str]
    start: Optional[int]
    url: Optional[str]
    header_text: Optional[str]
    description_text: Optional[str]
    cause: Optional[str]
    effect: Optional[str]
    end: Optional[int]


class SurveyTemplate(BaseModel):
    id: Optional[int]
    description: Optional[str]
    type: Optional[str]
    title: Optional[str]


class Author(BaseModel):
    id: Optional[int]
    institution_name: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]


class SurveyTemplateAuthor(BaseModel):
    survey_template_id: Optional[int]
    author_id: Optional[int]
    author_id: Optional[int]
    survey_template_id: Optional[int]
    display_order: Optional[int]


class TemplateSection(BaseModel):
    id: Optional[int]
    survey_template_id: Optional[int]
    description: Optional[str]
    display_order: Optional[int]
    title: Optional[str]
    display_next_page: Optional[bool]


class TemplateQuestion(BaseModel):
    id: Optional[int]
    survey_template_id: Optional[int]
    template_section_id: Optional[int]
    answer_format: Optional[str]
    display_order: Optional[int]
    text: Optional[str]
    description: Optional[str]


class ServiceAspect(BaseModel):
    id: Optional[int]
    title: Optional[str]
    weight: Optional[float]
    formula: Optional[str]


class MeasuresAspect(BaseModel):
    aspect_id: Optional[int]
    template_question_id: Optional[int]
    template_question_id: Optional[int]
    aspect_id: Optional[int]


class Survey(BaseModel):
    id: Optional[int]
    survey_template_id: Optional[int]


class SurveySubmission(BaseModel):
    id: Optional[int]
    survey_id: Optional[int]
    trip_id: Optional[str]
    timestamp: Optional[datetime]
    ticket_hash: Optional[str]


class SubmittedAnswer(BaseModel):
    id: Optional[int]
    template_question_id: Optional[int]
    submission_id: Optional[int]
    value: Optional[str]
