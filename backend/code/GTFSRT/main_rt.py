from google.transit import gtfs_realtime_pb2
import requests
from parser2 import *
from insert_rt import insert
from typing import Optional
from pydantic import BaseModel, ValidationError
from typing import Literal, Union
from classes_rt import FeedMessage


class FeedHeader(BaseModel):
    gtfsRealtimeVersion: Literal["2.0"]
    incrementality: str
    timestamp: int


# REALTIME_SOURCE = "http://s3.amazonaws.com/commtrans-realtime-prod/tripupdates.pb"
# https://translink.com.au/about-translink/open-data/gtfs-rt
# SOURCES = {
#     "trip_updates": "https://gtfsrt.api.translink.com.au/api/realtime/SEQ/TripUpdates",
#     "vehicle_updates": "https://gtfsrt.api.translink.com.au/api/realtime/SEQ/VehiclePositions",
#     "alerts": "https://gtfsrt.api.translink.com.au/api/realtime/SEQ/alerts",
# }
# REALTIME_SOURCE = SOURCES["alerts"]
# BATCH_SIZE: int = 500


def main(
    alerts: Optional[str] = None,
    tripUpdates: Optional[str] = None,
    vehiclePositions: Optional[str] = None,
    write: bool = False,
    batchSize: int = 200,
    verbose: bool = False,
) -> dict | None:

    def request_feed(source: str):
        feed = gtfs_realtime_pb2.FeedMessage()
        response = requests.get(source)
        feed.ParseFromString(response.content)
        return feed

    trip_updates_dict = []
    stop_time_updates_dict = []
    vehicle_positions_dict = []
    alerts_dict = []
    entity_selectors_dict = []

    def process_feed(feed):
        feed_dict = MessageToDict(feed)
        try:
            feed_pydantic = FeedMessage(**feed_dict)
        except ValidationError as e:
            raise e
        feed_df = pd.DataFrame(feed_dict["entity"])
        if "alert" in feed_df.columns:
            if not write:
                return feed_dict["entity"], None, None
            alerts_dict, entity_selectors_dict = parse_alert2(
                feed_df.alert.values, feed_df.id.values
            )
            return feed_dict["entity"], alerts_dict, entity_selectors_dict
        if "tripUpdate" in feed_df.columns:
            if not write:
                return feed_dict["entity"], None, None
            trip_updates_dict, stop_time_updates_dict = parse_trip_update(
                feed_df.tripUpdate.values, feed_df.id.values
            )
            return feed_dict["entity"], trip_updates_dict, stop_time_updates_dict
        if "vehicle" in feed_df.columns:
            if not write:
                return feed_dict["entity"], None
            vehicle_positions_dict = parse_vehicle_position(
                feed_df.vehicle.values, feed_df.id.values
            )
            return feed_dict["entity"], vehicle_positions_dict

    def send_requests(feed_name) -> None:
        match feed_name:
            case "trip_updates":
                insert(feed_name, trip_updates_dict, batchSize)
            case "stop_time_updates":
                insert(feed_name, stop_time_updates_dict, batchSize)
            case "vehicle_positions":
                insert(feed_name, vehicle_positions_dict, batchSize)
            case "alerts":
                insert(feed_name, alerts_dict, batchSize)
            case "entity_selectors":
                insert(feed_name, entity_selectors_dict, batchSize)

    result = {}
    if alerts:
        result["alerts"], alerts_dict, entity_selectors_dict = process_feed(
            request_feed(alerts)
        )
        if write:
            send_requests("alerts")
            send_requests("entity_selectors")

    if tripUpdates:
        result["tripUpdates"], trip_updates_dict, stop_time_updates_dict = process_feed(
            request_feed(tripUpdates)
        )
        if write:
            send_requests("trip_updates")
            send_requests("stop_time_updates")

    if vehiclePositions:
        result["tripUpdates"], vehicle_positions_dict = process_feed(
            request_feed(vehiclePositions)
        )
        if write:
            send_requests("vehicle_positions")
    if verbose:
        return result
    return None
