import { TripUpdateResult } from "@/types/gtfsrt";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const StatusDot = ({
    scheduleRelationship,
}: {
    scheduleRelationship: string | null;
}) => {
    const color = () => {
        switch (scheduleRelationship) {
            case "SCHEDULED":
                return "bg-green-700";
            case "NEW":
                return "bg-blue-600";
            case "CANCELED":
                return "bg-red-700";
            case "UNSCHEDULED":
                return "bg-orange-400";
            default:
                return "bg-gray-700";
        }
    };
    return (
        <div className={`rounded-full w-3 h-3 animate-pulse ${color()}`}></div>
    );
};

export default function RelatimeStatus({
    tripUpdates,
}: {
    tripUpdates: TripUpdateResult | undefined;
}) {
    return (
        tripUpdates && (
            <Tooltip>
                <TooltipTrigger>
                    <div className="font-mono font-light bg-secondary py-1 px-2 rounded-lg flex flex-row items-center gap-1">
                        <StatusDot
                            scheduleRelationship={
                                tripUpdates.scheduleRelationship
                            }
                        />
                        {tripUpdates && tripUpdates.scheduleRelationship}
                        <span
                            className={
                                tripUpdates &&
                                tripUpdates.delay &&
                                tripUpdates.delay > 0
                                    ? "text-red-700"
                                    : ""
                            }
                        >
                            {tripUpdates && tripUpdates.delay
                                ? tripUpdates.delay >= 0
                                    ? `+${tripUpdates.delay}`
                                    : tripUpdates.delay
                                : null}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    GTFS-RT status
                    {tripUpdates.timestamp && ` as of ${tripUpdates.timestamp}`}
                </TooltipContent>
            </Tooltip>
        )
    );
}
