import pandas as pd
import datetime
from dateutil.parser import parse
from utils import makePoint, parse_extended_time


def validate(dataframes: list[pd.DataFrame]) -> list[pd.DataFrame]:
    dataframes = validate_agency(dataframes)
    dataframes = validate_stops(dataframes)
    dataframes = validate_calendar(dataframes)
    dataframes = validate_calendar_dates(dataframes)
    dataframes = validate_shapes(dataframes)
    dataframes = validate_stop_times(dataframes)
    return dataframes


def validate_agency(dataframes: list[pd.DataFrame]) -> list[pd.DataFrame]:
    agency = dataframes["agency.txt"]
    if "agency_id" not in agency.columns:
        agency_id = "A1"
        dataframes["agency.txt"]["agency_id"] = agency_id
        dataframes["routes.txt"]["agency_id"] = agency_id
    return dataframes


def validate_stops(dataframes: list[pd.DataFrame]) -> list[pd.DataFrame]:
    stops: pd.DataFrame = dataframes["stops.txt"]
    stops["stop_lat_lon"] = makePoint(stops["stop_lat"], stops["stop_lon"])

    # Drop stop_lat and stop_lon columns
    stops.drop(["stop_lat", "stop_lon"], axis=1, inplace=True)

    stops.stop_id = stops.stop_id.astype(str)
    dataframes["stops.txt"] = stops
    return dataframes


def validate_calendar(dataframes: list[pd.DataFrame]) -> list[pd.DataFrame]:
    calendar: pd.DataFrame = dataframes["calendar.txt"]
    if type(calendar.service_id) != "string":
        calendar.service_id = calendar.service_id.astype(str)
    calendar["start_date"] = (
        calendar["start_date"].astype(str).apply(parse)
    ).dt.date.astype(str)
    calendar["end_date"] = (
        calendar["end_date"].astype(str).apply(parse)
    ).dt.date.astype(str)
    dataframes["calendar.txt"] = calendar
    return dataframes


def validate_calendar_dates(dataframes: list[pd.DataFrame]) -> list[pd.DataFrame]:
    calendar_dates: pd.DataFrame = dataframes["calendar_dates.txt"]
    if type(calendar_dates.service_id) != "string":
        calendar_dates.service_id = calendar_dates.service_id.astype(str)
    calendar_dates["date"] = (
        calendar_dates["date"].astype(str).apply(parse)
    ).dt.date.astype(str)
    dataframes["calendar_dates.txt"] = calendar_dates
    return dataframes


def validate_shapes(dataframes: list[pd.DataFrame]) -> list[pd.DataFrame]:
    shapes = dataframes["shapes.txt"]
    shapes["shape_pt_lat_lon"] = makePoint(
        shapes["shape_pt_lat"], shapes["shape_pt_lon"]
    )
    shapes.drop(["shape_pt_lat", "shape_pt_lon"], axis=1, inplace=True)
    return dataframes


def validate_frequencies(dataframes: list[pd.DataFrame]) -> list[pd.DataFrame]:
    frequencies = dataframes["frequencies.txt"]
    dataframes["frequencies.txt"] = frequencies
    return dataframes


def validate_stop_times(dataframes: list[pd.DataFrame]) -> list[pd.DataFrame]:
    stop_times = dataframes["stop_times.txt"]
    stop_times[["arrival_time_add_days", "arrival_time"]] = stop_times[
        "arrival_time"
    ].apply(parse_extended_time)
    stop_times[["departure_time_add_days", "departure_time"]] = stop_times[
        "departure_time"
    ].apply(parse_extended_time)
    dataframes["stop_times.txt"] = stop_times
    return dataframes
