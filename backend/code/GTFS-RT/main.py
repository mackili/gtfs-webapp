from google.transit import gtfs_realtime_pb2
import requests
import simplejson as json
import datetime
from parser import *
from insert_rt import insert
from optparse import OptionParser
import logging

# REALTIME_SOURCE = "http://s3.amazonaws.com/commtrans-realtime-prod/tripupdates.pb"
# https://translink.com.au/about-translink/open-data/gtfs-rt
SOURCES = {
    "trip_updates": "https://gtfsrt.api.translink.com.au/api/realtime/SEQ/TripUpdates",
    "vehicle_updates": "https://gtfsrt.api.translink.com.au/api/realtime/SEQ/VehiclePositions",
    "alerts": "https://gtfsrt.api.translink.com.au/api/realtime/SEQ/alerts",
}
REALTIME_SOURCE = SOURCES["alerts"]
BATCH_SIZE: int = 500

p = OptionParser()

p.add_option(
    "-t",
    "--trip-updates",
    dest="tripUpdates",
    default=None,
    help="The trip updates URL",
    metavar="URL",
)

p.add_option(
    "-w",
    "--write",
    dest="write",
    default=False,
    help="Write to DataBase",
    metavar="bool",
)

p.add_option(
    "-p",
    "--vehicle-positions",
    dest="vehiclePositions",
    default=None,
    help="The vehicle positions URL",
    metavar="URL",
)

p.add_option(
    "-a",
    "--alerts",
    dest="alerts",
    default=None,
    help="The alerts URL",
    metavar="URL",
)

p.add_option(
    "-b",
    "--batch-size",
    dest="batchSize",
    default=None,
    help="Batch size for API requests",
    metavar="int",
)

p.add_option(
    "-v",
    "--verbose",
    dest="verbose",
    default=False,
    help="Return retrieved data in response",
    metavar="bool",
)

opts, args = p.parse_args()


def main():
    if (
        opts.alerts is None
        and opts.tripUpdates is None
        and opts.vehiclePositions is None
    ):
        # opts.alerts = SOURCES["alerts"]
        # opts.tripUpdates = SOURCES["trip_updates"]
        # opts.vehiclePositions = SOURCES["vehicle_updates"]
        logging.error(
            "No trip updates, alerts, or vehicle positions URLs were specified!"
        )
        exit(1)

    # if opts.alerts is None:
    #     logging.warning("Warning: no alert URL specified, proceeding without alerts")

    # if opts.tripUpdates is None:
    #     logging.warning(
    #         "Warning: no trip update URL specified, proceeding without trip updates"
    #     )

    # if opts.vehiclePositions is None:
    #     logging.warning(
    #         "Warning: no vehicle positions URL specified, proceeding without vehicle positions"
    #     )

    # if opts.batchSize is None:
    #     logging.warning(
    #         f"No batch size specified. Proceeding with default {BATCH_SIZE}"
    #     )
    else:
        if type(opts.batchSize) == str:
            BATCH_SIZE = int(opts.batchSize)
        else:
            BATCH_SIZE = opts.batchSize

    def request_feed(source):
        feed = gtfs_realtime_pb2.FeedMessage()
        response = requests.get(source)
        feed.ParseFromString(response.content)
        return feed

    trip_updates_dict = []
    stop_time_updates_dict = []
    vehicle_positions_dict = []
    alerts_dict = []
    entity_selectors_dict = []

    def process_feed(feed) -> None:
        for entity in feed.entity:
            if entity.HasField("trip_update"):
                trip_update, stop_time_updates = parse_trip(entity.trip_update)
                trip_updates_dict.append(trip_update)
                stop_time_updates_dict.extend(stop_time_updates)
            if entity.HasField("vehicle"):
                vehicle_positions_dict.append(parse_vehicle_position(entity.vehicle))
            if entity.HasField("alert"):
                alert, entity_selectors = parse_alert(entity.alert, entity.id)
                alerts_dict.append(alert)
                entity_selectors_dict.extend(entity_selectors)

    def send_requests(feed_name) -> None:
        match feed_name:
            case "trip_updates":
                insert(feed_name, trip_updates_dict, BATCH_SIZE)
            case "stop_time_updates":
                insert(feed_name, stop_time_updates_dict, BATCH_SIZE)
            case "vehicle_positions":
                insert(feed_name, vehicle_positions_dict, BATCH_SIZE)
            case "alerts":
                insert(feed_name, alerts_dict, BATCH_SIZE)
            case "entity_selectors":
                insert(feed_name, entity_selectors_dict, BATCH_SIZE)

    if opts.alerts:
        process_feed(request_feed(opts.alerts))
        if opts.write == "True":
            send_requests("alerts")
            send_requests("entity_selectors")

    if opts.tripUpdates:
        process_feed(request_feed(opts.tripUpdates))
        if opts.write == "True":
            send_requests("trip_updates")
            send_requests("stop_time_updates")

    if opts.vehiclePositions:
        process_feed(request_feed(opts.vehiclePositions))
        if opts.write == "True":
            send_requests("vehicle_positions")

    if opts.verbose:
        print(
            json.dumps(
                {
                    "alerts": alerts_dict,
                    "tripUpdates": trip_updates_dict,
                    "stopTimeUpdates": stop_time_updates_dict,
                    "vehiclePositions": vehicle_positions_dict,
                    "entitySelectors": entity_selectors_dict,
                },
                ignore_nan=True,
                default=datetime.isoformat,
            )
        )
    if not opts.verbose:
        print(json.dumps({}))


if __name__ == "__main__":
    main()
