from google.transit import gtfs_realtime_pb2
import requests
from parser2 import *
from insert_rt import insert
from optparse import OptionParser

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

if type(opts.verbose) == str:
    if opts.verbose.lower() == "true":
        opts.verbose = True
    else:
        opts.verbose = False


if type(opts.write) == str:
    if opts.write.lower() == "true":
        opts.write = True
    else:
        opts.write = False


def main(
    alerts: str = opts.alerts,
    tripUpdates: str = opts.tripUpdates,
    vehiclePositions: str = opts.vehiclePositions,
    write: bool = opts.write,
    batchSize: int = opts.batchSize,
    verbose: bool = opts.verbose,
) -> dict | None:
    if alerts is None and tripUpdates is None and vehiclePositions is None:
        alerts = SOURCES["alerts"]
        write = True
        BATCH_SIZE = 200
        tripUpdates = SOURCES["trip_updates"]
        vehiclePositions = SOURCES["vehicle_updates"]
        # logging.error(
        #     "No trip updates, alerts, or vehicle positions URLs were specified!"
        # )
        # exit(1)

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
        if type(batchSize) == str:
            BATCH_SIZE = int(batchSize)
        else:
            BATCH_SIZE = batchSize

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
                insert(feed_name, trip_updates_dict, BATCH_SIZE)
            case "stop_time_updates":
                insert(feed_name, stop_time_updates_dict, BATCH_SIZE)
            case "vehicle_positions":
                insert(feed_name, vehicle_positions_dict, BATCH_SIZE)
            case "alerts":
                insert(feed_name, alerts_dict, BATCH_SIZE)
            case "entity_selectors":
                insert(feed_name, entity_selectors_dict, BATCH_SIZE)

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


# main()
