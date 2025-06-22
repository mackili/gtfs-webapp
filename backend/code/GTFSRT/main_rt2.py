from google.transit import gtfs_realtime_pb2
import requests
from google.protobuf.json_format import MessageToDict
from insert_rt2 import insert
from parser3 import transform_feed
from typing import List, Optional
from pydantic import BaseModel, ValidationError, AnyUrl
from typing import Literal, Union
from classes_rt import FeedMessage, FeedEntity
import asyncio


# https://translink.com.au/about-translink/open-data/gtfs-rt
# SOURCES = {
#     "trip_updates": "https://gtfsrt.api.translink.com.au/api/realtime/SEQ/TripUpdates",
#     "vehicle_updates": "https://gtfsrt.api.translink.com.au/api/realtime/SEQ/VehiclePositions",
#     "alerts": "https://gtfsrt.api.translink.com.au/api/realtime/SEQ/alerts",
# }


def main(
    url: AnyUrl,
    write: bool = False,
    batchSize: Optional[int] = 200,
    verbose: bool = False,
    dbUrl: Optional[str] = None,
) -> None | List[FeedEntity]:

    def request_feed(source: AnyUrl):
        feed = gtfs_realtime_pb2.FeedMessage()
        response = requests.get(str(source))
        feed.ParseFromString(response.content)
        return feed

    def process_feed(feed) -> List[FeedEntity]:
        feed_dict = MessageToDict(feed)
        try:
            feed_pydantic = FeedMessage(**feed_dict)
        except ValidationError as e:
            raise e
        return feed_pydantic.entity

    def send_requests(entities: List[FeedEntity]) -> None:
        res = transform_feed(entities)
        res_dict = res.model_dump()
        insert(
            "vehicle_positions",
            res_dict["vehicle_positions"],
            batch_size=1 if batchSize is None else batchSize,
            dbUrl=str(dbUrl),
        )
        insert(
            "trip_updates",
            res_dict["trip_updates"],
            batch_size=1 if batchSize is None else batchSize,
            dbUrl=str(dbUrl),
        )
        insert(
            "stop_time_updates",
            res_dict["stop_time_updates"],
            batch_size=1 if batchSize is None else batchSize,
            dbUrl=str(dbUrl),
        )
        return

    result = {}
    result = process_feed(request_feed(url))
    if write:
        send_requests(result)
    if verbose:
        return result
    return None


background_task_stop_event = asyncio.Event()


# Background function to process the feed continuously
async def background_function(
    url: AnyUrl, batchSize: int, verbose: bool, write: bool, sleep: int
):
    global background_task_stop_event
    while not background_task_stop_event.is_set():
        print("working")
        try:
            main(url, write=write, batchSize=batchSize, verbose=verbose)
        except Exception as e:
            print(f"Error in background function: {e}")
        await asyncio.sleep(sleep)  # Adjust the interval as needed


# Function to stop the background task
def stop_background_function():
    global background_task_stop_event
    background_task_stop_event.set()
