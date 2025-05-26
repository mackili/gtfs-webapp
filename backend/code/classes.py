from pydantic import BaseModel, AnyUrl


class GTFSRT_Options(BaseModel):
    tripUpdates: AnyUrl | None = None
    vehiclePositions: AnyUrl | None = None
    alerts: AnyUrl | None = None
    batchSize: int | None = None
    verbose: bool = False
    write: bool = False


class GTFSRT_Response(BaseModel):
    alerts: list
    tripUpdates: list
    vehiclePositions: list
