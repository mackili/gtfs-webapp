import { H1, H2, P } from "@/components/ui/typography";
import { titleCase } from "@/functions/utils";
import { calendarDaysRunBool } from "@/types/misc";
import {
    RouteDetailsView,
    StopTimesForTrip,
    TripDetailsView,
} from "@/types/gtfs";
import {
    queryRouteDetails,
    queryStopTimesForTrip,
    queryTripDetails,
    calculateAspectValues,
    queryTemplatesTable,
    querySurveysTable,
    queryTripUpdates,
} from "@/functions/dbQuery";
import { twMerge } from "tailwind-merge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfocardsMap } from "@/components/infocards-map";
import SelectToPath from "@/components/select-to-query";
import { ServiceAspectResult, Survey, SurveyTemplate } from "@/types/surveys";
import { Label } from "@/components/ui/label";
import RouteDetails from "../../routes/[routeId]/route-details";
import RouteTypeIcon from "../../routes/[routeId]/route-type-icon";
import RouteColorDot from "../../routes/[routeId]/route-color";
import AspectValueDisplay from "@/components/aspect-value-display";
import Link from "next/link";
import RelatimeStatus from "@/components/ui/realtime-status";

export default async function Home({
    params,
    searchParams,
}: {
    params: Promise<{ tripId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const tripId = (await params).tripId;
    const query = await searchParams;
    const tripData: TripDetailsView = (await queryTripDetails(tripId))
        .items[0] as TripDetailsView;
    const tripRunDays = calendarDaysRunBool.safeParse(tripData.calendar);
    const routeData: RouteDetailsView = (
        await queryRouteDetails(tripData.routeId)
    ).items[0] as RouteDetailsView;
    const stopTimes: StopTimesForTrip[] = (await queryStopTimesForTrip(tripId))
        .items as StopTimesForTrip[];

    const availableSurveyTemplates = (await queryTemplatesTable({}))
        .items as SurveyTemplate[];
    const availableSurveys =
        ((
            await querySurveysTable({
                query: query.templateId
                    ? `surveyTemplateId=eq.${query.templateId}`
                    : "",
            })
        )?.items as Survey[]) || [];
    const calculatedValues: ServiceAspectResult[] =
        query.templateId && query.surveyId
            ? (
                  await calculateAspectValues({
                      surveyTemplateId:
                          typeof query.templateId !== "string"
                              ? query.templateId.toString()
                              : query.templateId,
                      surveyId:
                          typeof query.surveyId !== "string"
                              ? query.surveyId.toString()
                              : query.surveyId,
                      tripId: [tripId],
                  })
              ).items
            : [];
    const tripUpdates = await queryTripUpdates(tripId);
    return (
        <div className="flex flex-col mx-10 mb-10">
            <div className="flex w-full items-center gap-8 my-10">
                <H1 text={`${routeData.routeShortName || ""}`} />
                <RouteColorDot routeColor={routeData.routeColor} />
                <H2 text={tripData.tripHeadsign || ""} className="pb-0" />
                <RouteTypeIcon routeType={Number(routeData.routeType)} />
                <RelatimeStatus tripUpdates={tripUpdates} />
            </div>
            <div className="grid md:grid-cols-7 gap-8">
                <div className="md:col-span-5 gap-4">
                    <div className="grid md:grid-cols-3 items-center justify-between gap-8">
                        <div className="md:col-span-2">
                            <div className="grid lg:grid-cols-7 md:grid-cols-4 sm:grid-cols-7 grid-cols-4 gap-2 overflow-scroll">
                                {tripRunDays.success &&
                                    Object.keys(tripRunDays.data).map(
                                        (key, index) => (
                                            <Tooltip key={index}>
                                                <TooltipTrigger>
                                                    <div
                                                        className={twMerge(
                                                            "transition-all hover:bg-accent/10 hover:text-accent-foreground rounded-md w-12 h-12 flex flex-row flex-nowrap items-center justify-center gap-2 border bg-background shadow-xs",
                                                            // @ts-expect-error its fine, data is validated
                                                            !tripRunDays.data[
                                                                key
                                                            ] &&
                                                                "opacity-40 bg-accent"
                                                        )}
                                                    >
                                                        {titleCase(key).slice(
                                                            0,
                                                            3
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {
                                                        // @ts-expect-error its fine, data is validated
                                                        (tripRunDays.data[
                                                            key
                                                        ] === true
                                                            ? "Runs on "
                                                            : "Does not run on ") +
                                                            titleCase(key) +
                                                            "s"
                                                    }
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    )}
                                <div className="col-span-full text-sm font-light">{`${tripData.calendar.startDate} - ${tripData.calendar.endDate}`}</div>
                            </div>
                        </div>
                        <div className="col-span-full sm:grid-cols-2 grid gap-4">
                            <Link
                                href={`/admin/routes/${routeData.routeId}`}
                                className="col-span-full"
                            >
                                <RouteDetails
                                    data={{
                                        ...routeData,
                                        averageDelay:
                                            tripData.tripUpdates[0]
                                                ?.averageDelay || undefined,
                                    }}
                                />
                            </Link>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="templateSelect">
                                    Survey Template
                                </Label>
                                <SelectToPath
                                    key="templateSelect"
                                    values={availableSurveyTemplates.map(
                                        (template) => ({
                                            value: template.id,
                                            label: template.title,
                                        })
                                    )}
                                    className="w-full"
                                    placeholder="Select a Survey Template"
                                    paramKey="templateId"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="templateSelect">Survey</Label>
                                <SelectToPath
                                    key="templateSelect"
                                    // @ts-expect-error only values with ids are in the database
                                    values={availableSurveys.map((survey) => ({
                                        value: survey.id,
                                        label: `${survey.id} (${
                                            survey.isActive === true
                                                ? "Active"
                                                : "Inactive"
                                        })`,
                                    }))}
                                    className="w-full"
                                    placeholder="Select a Survey Template"
                                    paramKey="surveyId"
                                    disabled={!query.templateId}
                                />
                            </div>
                            <div className="col-span-full grid md:grid-cols-2 gap-4">
                                {calculatedValues.map((aspect, index) => (
                                    <InfocardsMap
                                        key={index}
                                        title={aspect.serviceAspectTitle}
                                        data={{}}
                                        contentOverride={
                                            <AspectValueDisplay
                                                aspect={aspect}
                                            />
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2 gap-2 flex flex-col">
                    {stopTimes
                        .sort((a, b) => a.stopSequence - b.stopSequence)
                        .map((halt, index) => {
                            const stopTimeUpdate =
                                tripUpdates &&
                                tripUpdates.stopTimeUpdates.find(
                                    (stop) =>
                                        stop.stopId === halt.stopId ||
                                        stop.stopSequence === halt.stopSequence
                                );
                            const updArrivalTime = stopTimeUpdate?.arrivalTime
                                ? new Date(stopTimeUpdate?.arrivalTime)
                                : undefined;
                            const updDepartureTime =
                                stopTimeUpdate?.departureTime
                                    ? new Date(stopTimeUpdate?.departureTime)
                                    : undefined;
                            return (
                                <div key={index} className="">
                                    <div className="w-1"></div>
                                    <div className="transition-all hover:bg-accent/10 hover:text-accent-foreground rounded-md p-4 has-[>svg]:px-4 flex flex-row flex-nowrap items-center gap-2 border bg-background shadow-xs">
                                        <div
                                            className={twMerge(
                                                "border-solid h-8 w-8 border-primary border-2 rounded-full flex-none flex items-center justify-center",
                                                (index === 0 ||
                                                    index ===
                                                        stopTimes.length - 1) &&
                                                    "bg-primary"
                                            )}
                                        >
                                            <P
                                                className={twMerge(
                                                    "text-sm font-light",
                                                    (index === 0 ||
                                                        index ===
                                                            stopTimes.length -
                                                                1) &&
                                                        "text-secondary"
                                                )}
                                                text={(index + 1).toString()}
                                            />
                                        </div>
                                        <div className="flex flex-col text-xs gap-1">
                                            <p>
                                                <span
                                                    className={
                                                        updArrivalTime &&
                                                        "line-through"
                                                    }
                                                >
                                                    {halt.arrivalTime}
                                                </span>
                                                <span>
                                                    {updArrivalTime &&
                                                        `${updArrivalTime
                                                            .getHours()
                                                            .toString()
                                                            .padStart(
                                                                2,
                                                                "0"
                                                            )}:${updArrivalTime
                                                            .getMinutes()
                                                            .toString()
                                                            .padStart(
                                                                2,
                                                                "0"
                                                            )}:${updArrivalTime
                                                            .getSeconds()
                                                            .toString()
                                                            .padStart(2, "0")}`}
                                                </span>
                                            </p>
                                            <p>
                                                <span
                                                    className={
                                                        updDepartureTime &&
                                                        "line-through"
                                                    }
                                                >
                                                    {halt.departureTime}
                                                </span>
                                                <span>
                                                    {updDepartureTime &&
                                                        `${updDepartureTime
                                                            .getHours()
                                                            .toString()
                                                            .padStart(
                                                                2,
                                                                "0"
                                                            )}:${updDepartureTime
                                                            .getMinutes()
                                                            .toString()
                                                            .padStart(
                                                                2,
                                                                "0"
                                                            )}:${updDepartureTime
                                                            .getSeconds()
                                                            .toString()
                                                            .padStart(2, "0")}`}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="ml-1 hover:underline">
                                            <Link
                                                href={`/admin/stations/${
                                                    halt.stops?.parentStation
                                                        ?.stopId ||
                                                    halt.stops.stopId
                                                }`}
                                            >
                                                {halt.stops?.parentStation
                                                    ?.stopName ||
                                                    halt.stops.stopName}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
