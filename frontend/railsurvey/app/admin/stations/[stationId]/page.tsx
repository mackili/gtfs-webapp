"use server";
import { H1, H3, P } from "@/components/ui/typography";
import {
    queryStationDetails,
    queryTemplatesTable,
    querySurveysTable,
    calculateAspectValues,
} from "@/functions/dbQuery";
import { z } from "zod/v4";
import { StationDetails, stationDetailsSchema } from "@/types/gtfs";
import { InfocardsMap } from "@/components/infocards-map";
import Link from "next/link";
import SelectToPath from "@/components/select-to-query";
import { Label } from "@/components/ui/label";
import { SurveyTemplate, Survey, ServiceAspectResult } from "@/types/surveys";
import AspectValueDisplay from "@/components/aspect-value-display";

function isoTimeStringToDate(str: string) {
    const [h = "0", m = "0", s = "0"] = str.split(":");
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
}

function concatenateStopTimes(stationData: StationDetails) {
    return stationData.stopTimes
        .concat(
            stationData.childStations.flatMap((platform) =>
                platform.stopTimes.map((stopTime) => ({
                    platformCode: platform.platformCode,
                    ...stopTime,
                }))
            )
        )
        .sort(
            (a, b) =>
                isoTimeStringToDate(a.arrivalTime) -
                isoTimeStringToDate(b.departureTime)
        );
}

function tripIdList(stationDetails: StationDetails | undefined): string[] {
    if (!stationDetails) return [];
    const tripIds = new Set(
        concatenateStopTimes(stationDetails).map((stopTime) => stopTime.tripId)
    );
    return Array.from(tripIds);
}

export default async function Home({
    params,
    searchParams,
}: {
    params: Promise<{ stationId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { stationId } = await params;
    const query = await searchParams;
    const error: { isError: boolean; errorMessage?: string } = {
        isError: false,
        errorMessage: undefined,
    };
    let stationData: StationDetails | undefined;
    let departures;
    try {
        stationData = stationDetailsSchema.parse(
            (
                await queryStationDetails({
                    query: `stopId=eq.${stationId}`,
                })
            ).items[0]
        );
        departures = concatenateStopTimes(stationData);
    } catch (e) {
        if (e instanceof z.ZodError) {
            error.isError = true;
            error.errorMessage = e.message;
        }
    }

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
                      tripId: tripIdList(stationData),
                  })
              ).items
            : [];
    return (
        <div className="flex flex-col mx-10">
            <div className="grid w-full my-10">
                <H1
                    className={error.isError === true ? "hidden" : ""}
                    text={stationData ? stationData.stopName : ""}
                />
                <P
                    className={error.isError !== true ? "hidden" : ""}
                    text={error.errorMessage || "An error occured"}
                />
            </div>
            <div className="grid md:grid-cols-7 gap-8">
                <div className="md:col-span-5 flex flex-col gap-8">
                    <div>
                        <InfocardsMap
                            title="Details"
                            titleFormat="H3"
                            data={{
                                stopId: stationData?.stopId,
                                stopCode: stationData?.stopCode,
                                stopDescription: stationData?.stopDesc,
                                stopUrl: stationData?.stopUrl,
                                wheelchairBoarding:
                                    stationData?.wheelchairBoarding,
                                coordinates: stationData?.stopLatLon,
                            }}
                            columns={2}
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
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
                    </div>
                    <div className="col-span-full grid md:grid-cols-2 gap-4">
                        {calculatedValues.map((aspect, index) => (
                            <InfocardsMap
                                key={index}
                                title={aspect.serviceAspectTitle}
                                data={{}}
                                contentOverride={
                                    <AspectValueDisplay aspect={aspect} />
                                }
                            />
                        ))}
                    </div>
                </div>
                <div className="md:col-span-2 flex flex-col gap-2 max-h-256 overflow-y-scroll">
                    <H3 text={`Departures (${(departures || []).length})`} />
                    {(departures || []).map((departure, index) => (
                        <Link
                            key={index}
                            href={`/admin/trips/${departure.tripId}`}
                        >
                            <InfocardsMap
                                title={`${departure.routeShortName || ""} ${
                                    departure.tripHeadsign
                                }`}
                                data={departure}
                                keysFilter={[
                                    "arrivalTime",
                                    "departureTime",
                                    "platformCode",
                                    "routeLongName",
                                ]}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
