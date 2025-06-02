import pandas as pd
import zipfile
import io


def makePoint(latitude: pd.Series, longitude: pd.Series) -> pd.Series:
    return "(" + latitude.astype(str) + "," + longitude.astype(str) + ")"


def parse_extended_time(time_str):
    hours, minutes, seconds = map(int, time_str.split(":"))
    days_added = hours // 24
    normalized_hour = hours - days_added * 24
    normalized_time_str = f"{normalized_hour:02}:{minutes:02}:{seconds:02}"
    return days_added, normalized_time_str


def unzip(binary_data: bytes):
    data = {}
    with zipfile.ZipFile(io.BytesIO(binary_data)) as z:
        for file_name in z.namelist():
            if file_name.endswith(".txt") and not file_name.startswith(
                "__MACOSX"
            ):  # Process only .txt files
                with z.open(file_name) as f:
                    decoded_content = f.read().decode("utf-8")
                    data[file_name] = pd.read_csv(
                        io.StringIO(decoded_content), delimiter=","
                    )
    return data
