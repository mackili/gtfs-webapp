import { H1, H2, H3 } from "@/components/ui/typography";
import { RouteDetailsView } from "@/types/gtfs";
import {
    queryRouteDetails,
    calculateAspectValues,
    queryTemplatesTable,
    querySurveysTable,
} from "@/functions/dbQuery";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfocardsMap } from "@/components/infocards-map";
import SelectToPath from "@/components/select-to-query";
import { ServiceAspectResult, Survey, SurveyTemplate } from "@/types/surveys";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import RouteDetails from "./route-details";
import RouteColorDot from "./route-color";
import RouteTypeIcon from "./route-type-icon";
import Link from "next/link";

export default async function Home({
    params,
    searchParams,
}: {
    params: Promise<{ routeId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const routeId = (await params).routeId;
    const query = await searchParams;
    const routeData: RouteDetailsView = (await queryRouteDetails(routeId))
        .items[0] as RouteDetailsView;
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
                      routeId: [routeId],
                  })
              ).items
            : [];
    const allDelays = routeData.trips
        .flatMap((trip) =>
            trip.tripUpdates.map((update) => update.averageDelay)
        )
        .filter((delay) => typeof delay === "number" && !isNaN(delay));

    const averageDelay =
        allDelays.length > 0
            ? allDelays.reduce((sum, d) => sum + (d as number), 0) /
              allDelays.length
            : null;
    return (
        <div className="flex flex-col mx-10 mb-10">
            <div className="flex flex-col w-full gap-4 my-10">
                <div className="flex items-center gap-2">
                    <H1 text={`${routeData.routeShortName || ""}`} />
                    <RouteColorDot routeColor={routeData.routeColor} />
                    <RouteTypeIcon routeType={Number(routeData.routeType)} />
                </div>
                <H2 text={routeData.routeLongName || ""} className="pb-0" />
            </div>
            <div className="grid md:grid-cols-7 gap-8">
                <div className="md:col-span-5 gap-4">
                    <div className="grid md:grid-cols-3 items-center justify-between gap-8">
                        <div className="md:col-span-3">
                            <RouteDetails
                                data={{
                                    ...routeData,
                                    averageDelay: averageDelay || undefined,
                                }}
                            />
                        </div>
                        <div className="col-span-full sm:grid-cols-2 grid gap-4">
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
                                            typeof aspect.value === "string" ||
                                            typeof aspect.value === "number" ? (
                                                <H2
                                                    text={
                                                        typeof aspect.value ===
                                                        "number"
                                                            ? aspect.value.toString()
                                                            : aspect.value
                                                    }
                                                />
                                            ) : (
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <AlertTriangle className="stroke-orange-500" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {`Error: ${aspect.value.errorMessage}`}
                                                    </TooltipContent>
                                                </Tooltip>
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2 gap-2 flex flex-col">
                    <H3 text={`Trips (${routeData.trips.length})`} />
                    {routeData.trips.map((trip, index) => (
                        <Link key={index} href={`/admin/trips/${trip.tripId}`}>
                            <InfocardsMap
                                // title={`${trip.tripId || ""}`}
                                data={{ tripId: trip.tripId }}
                                keysFilter={["tripId"]}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
