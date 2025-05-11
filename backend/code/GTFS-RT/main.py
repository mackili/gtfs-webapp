from google.transit import gtfs_realtime_pb2
import requests
import json
from parser import *
from insert_rt import insert

# REALTIME_SOURCE = "http://s3.amazonaws.com/commtrans-realtime-prod/tripupdates.pb"
# https://translink.com.au/about-translink/open-data/gtfs-rt
REALTIME_SOURCE = "https://gtfsrt.api.translink.com.au/api/realtime/SEQ/TripUpdates"
BATCH_SIZE = 1000

feed = gtfs_realtime_pb2.FeedMessage()
response = requests.get(REALTIME_SOURCE)
feed.ParseFromString(response.content)

trip_updates_dict = []
stop_time_updates_dict = []

for entity in feed.entity:
    if entity.HasField("trip_update"):
        trip_update, stop_time_updates = parse_trip(entity.trip_update)
        trip_updates_dict.append(trip_update)
        stop_time_updates_dict.extend(stop_time_updates)

print(insert("trip_updates", trip_updates_dict))
print(insert("stop_time_updates", stop_time_updates_dict))
with open("parsed_trip.json", "w") as json_file:
    json.dump(trip_updates_dict, json_file, indent=4)
with open("parsed_stop.json", "w") as json_file:
    json.dump(stop_time_updates_dict, json_file, indent=4)
