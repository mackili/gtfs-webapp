from pydantic import BaseModel
from typing import Literal


class FeedHeader(BaseModel):
    gtfsRealtimeVersion: Literal["2.0"]
    incrementality: str
    timestamp: int
