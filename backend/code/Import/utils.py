import pandas as pd


def makePoint(latitude: pd.Series, longitude: pd.Series) -> pd.Series:
    return "(" + latitude.astype(str) + "," + longitude.astype(str) + ")"


def parse_extended_time(time_str):
    hours, minutes, seconds = map(int, time_str.split(":"))
    days_added = hours // 24
    normalized_hour = hours - days_added * 24
    normalized_time_str = f"{normalized_hour:02}:{minutes:02}:{seconds:02}"
    return pd.Series([days_added, normalized_time_str])
