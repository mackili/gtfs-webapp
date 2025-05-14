from pydantic import BaseModel, AnyUrl


class GTFSRT_Options(BaseModel):
    tripUpdates: AnyUrl | None  # Optional
    vehiclePositions: AnyUrl | None  # Optional
    alerts: AnyUrl | None  # Optional
    batchSize: int | None  # Optional
    verbose: bool | False  # Optional
    write: bool | False  # Optional


class GTFSRT_Response(BaseModel):
    alerts: list
    tripUpdates: list
    vehiclePositions: list
