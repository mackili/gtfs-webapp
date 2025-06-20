"use server";
import { SummaryData, AgencySummaryView, AgencyStatic } from "@/types/db";
import {
    Route,
    Stops,
    TripDetailsView,
    RouteDetailsView,
    StationDetails,
} from "@/types/gtfs";
import {
    CompositeSubmission,
    ServiceAspect,
    ServiceAspectFormula,
    Survey,
    SurveyTemplate,
    TemplateSummary,
} from "@/types/surveys";
import { encodeBinary, decodeBinary } from "./encoder";

type QueryInput = {
    table: string;
    query?: string | undefined;
    fields?: string | undefined;
    filter?: string | undefined;
    order?: string | undefined;
    offset?: number | undefined;
    limit?: number | undefined;
    range?: string | undefined;
    select?: string;
};

type QueryResponseItemBase =
    | Stops
    | Route
    | TemplateSummary
    | Survey
    | CompositeSubmission
    | TripDetailsView
    | RouteDetailsView
    | StationDetails;

export type QueryResponseItem = QueryResponseItemBase & {
    id: string | number;
};

export type QueryResponse = {
    totalSize: number | "*";
    itemsStart: number;
    itemsEnd: number;
    items: [] | QueryResponseItem[];
};

export async function queryAgencyDetails(
    agencyId: string | void
): Promise<SummaryData[]> {
    const queryString: string | void = agencyId
        ? `agencyId.eq(${agencyId})`
        : "";
    let summary: AgencySummaryView[] = [];
    const queryInput: QueryInput = {
        table: "agencySummaryView",
        query: queryString,
    };
    try {
        summary = ((await queryDB(queryInput)) as QueryResponse)
            .items as AgencySummaryView[];
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("An unknown error occurred");
        }
        summary = [];
    }
    const summaries: SummaryData[] = [];
    summary.map((agency) => {
        const statistics: AgencyStatic[] = [
            {
                id: "datetime",
                title:
                    new Intl.DateTimeFormat("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        timeZone: agency.agencyTimezone,
                    }).format(Date.now()) +
                    " " +
                    agency.agencyTimezone,
                value: new Intl.DateTimeFormat("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: agency.agencyTimezone,
                }).format(Date.now()),
            },
            {
                id: "routeCount",
                title: "Routes",
                value: agency.routeCount,
            },
            {
                id: "tripsCount",
                title: "Trips",
                value: agency.tripCount,
            },
            { id: "alertsCount", title: "Alerts", value: agency.alertCount },
        ];
        summaries.push({
            agencyId: agency.agencyId,
            agencyName: agency.agencyName,
            agencyUrl: agency.agencyUrl,
            agencyTimezone: agency.agencyTimezone,
            statistics,
        });
    });

    return summaries;
}

export async function queryDB(
    input: QueryInput
): Promise<QueryResponse | [] | string | null> {
    let endpoint = process.env.BACKEND_URL + `/query?table=${input.table}`;
    // Dynamically append all keys from QueryInput as query parameters
    Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined && key !== "table" && key !== "headers") {
            endpoint += `&${key}=${value.toString()}`;
        }
    });
    const res = await fetch(endpoint);
    return res.json();
}

type QueryTableInput = {
    limit?: number | undefined;
    offset?: number | undefined;
    order?: string | undefined;
    range?: [number, number];
    filter?: string;
    query?: string;
};

export async function queryStationsTable(input: QueryTableInput) {
    const queryInput: QueryInput = {
        table: "stops",
        fields: "id:stopId,stopId,stopCode,stopName,parentStation,wheelchairBoarding,locationType",
        filter: "location_type=in.(0,1),parent_station.is(null)",
        order: input.order,
        offset: input.offset,
        range: input.range?.toString().replace(",", "-"),
    };
    let data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    if (!data.totalSize || data.totalSize == 0) {
        queryInput.filter = undefined;
        data = (await queryDB(queryInput)) as QueryResponse;
    }
    return data;
}

export async function queryRouteDetails(routeId: string) {
    const queryInput: QueryInput = {
        table: "routes",
        fields: "routeId,routeType,agencyId,routeShortName,routeLongName,routeUrl,routeDesc,routeColor,agency(agencyName)",
        filter: `route_id=eq.${routeId}`,
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    return data;
}

export async function querySurveyTemplate(surveyTemplateId: number) {
    const queryInput: QueryInput = {
        table: "surveyTemplate",
        fields: "id,title,displayTitle,description,type,surveyTemplateAuthors:surveyTemplateAuthor(author(id,firstName,lastName,institutionName)),templateSections:templateSection(id,displayOrder,title,description,displayNextPage),templateQuestions:templateQuestion(id,displayOrder,text,templateSection_id,answerFormat,isRequired,minValue,maxValue),serviceAspectFormulas:serviceAspectFormula(id,weight,formula,serviceAspect(id,title))",
        filter: `id=eq.${surveyTemplateId}`,
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    // Decoding formula from binary to text
    (data.items as TemplateSummary[]).map((template) =>
        template.serviceAspectFormulas?.map(
            (formula) => (formula.formula = decodeBinary(formula.formula))
        )
    );
    return data.items[0] as TemplateSummary;
}

export async function queryStationDetails(input: QueryTableInput) {
    const queryInput: QueryInput = {
        table: "stops",
        fields: "stopId,stopCode,stopName,stopDesc,stopLatLon,stopUrl,wheelchairBoarding,locationType,childStations:stops(stopId,platformCode,locationType,stopTimes(arrivalTime,departureTime,...trips(tripHeadsign,tripId,tripShortName,...routes(routeId,routeShortName,routeLongName,routeColor)))),stopTimes(arrivalTime,departureTime,trips(tripHeadsign,tripShortName,...routes(routeId,routeShortName,routeLongName,routeColor)))",
        limit: 1,
        query: input.query,
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    return data;
}

export async function queryRoutesTable(input: QueryTableInput) {
    const queryInput: QueryInput = {
        table: "routes",
        fields: "id:routeId,routeId,routeId,routeType,agencyId,routeShortName,routeLongName",
        order: input.order,
        offset: input.offset,
        range: input.range?.toString().replace(",", "-"),
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    const itemsUpdated = (data.items as Route[]).map((item) => {
        item.routeShortName =
            item.routeShortName ||
            (typeof item.routeLongName === "string"
                ? item.routeLongName.substring(0, 40)
                : "");
        return item;
    });
    data.items = itemsUpdated;
    return data;
}

export async function queryTemplatesTable(input: QueryTableInput) {
    const queryInput: QueryInput = {
        table: "surveyTemplate",
        fields: "id,title,displayTitle,type",
        order: input.order,
        offset: input.offset,
        range: input.range?.toString().replace(",", "-"),
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    return data;
}

export async function queryTripsTable(input: QueryTableInput) {
    const queryInput: QueryInput = {
        table: "trips",
        fields: "tripId,id:tripId,routes(routeId,routeShortName,routeLongName),tripHeadsign",
        order: input.order,
        offset: input.offset,
        range: input.range?.toString().replace(",", "-"),
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    return data;
}

export async function queryServiceAspectTable(input: QueryTableInput) {
    const queryInput: QueryInput = {
        table: "serviceAspect",
        fields: "id,title",
        order: input.order,
        offset: input.offset,
        range: input.range?.toString().replace(",", "-"),
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    return data;
}

export async function queryTripDetails(tripId: string) {
    const queryInput: QueryInput = {
        table: "trips",
        fields: "tripId,tripHeadsign,tripShortName,directionId,blockId,shapeId,wheelchairAccessible,bikesAllowed,calendar(*,calendarDates(*)),routeId",
        query: `tripId=eq.${tripId}`,
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    return data;
}

export async function queryStopTimesForTrip(tripId: string) {
    const queryInput: QueryInput = {
        table: "stopTimes",
        fields: "stopSequence,arrivalTime,departureTime,arrivalTimeAddDays,departureTimeAddDays,stopHeadsign,shapeDistTraveled,stops(stopId,stopName,stopCode,locationType,stopDesc,wheelchairBoarding,stopUrl,platformCode,stopLatLon,parentStation(stopId,stopName,stopCode,locationType,stopUrl,stopDesc,wheelchairBoarding,stopLatLon))",
        query: `tripId=eq.${tripId}`,
        order: "stopSequence.asc",
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    return data;
}

export async function querySurveysTable(input: QueryTableInput) {
    const queryInput: QueryInput = {
        table: "survey",
        fields: "id,surveyTemplateId,isActive,uuid,timestamp,surveyTemplate(title,displayTitle)",
        order: input.order,
        offset: input.offset,
        range: input.range?.toString().replace(",", "-"),
        query: input.query,
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    return data;
}

export async function querySurveyDetails({
    surveyId,
    surveyUuid,
}: {
    surveyId?: number | string;
    surveyUuid?: string;
}) {
    const queryInput: QueryInput = {
        table: "survey",
        fields: "id,surveyTemplateId,isActive,timestamp,uuid,surveyTemplate(title,displayTitle),surveySubmission(id.count())",
        query: surveyUuid ? `uuid=eq.${surveyUuid}` : `id=eq.${surveyId}`,
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    return data;
}

export async function queryServiceAspect(serviceAspectId: number) {
    const queryInput: QueryInput = {
        table: "serviceAspect",
        filter: `id=eq.${serviceAspectId}`,
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    return data.items[0] as ServiceAspect;
}

export async function queryServiceAspectFormulaList(serviceAspectId: number) {
    const queryInput: QueryInput = {
        table: "serviceAspectFormula",
        fields: "id,surveyTemplateId,surveyTemplate(id,title,displayTitle,type),weight,formula",
        query: `serviceAspectId=eq.${serviceAspectId}`,
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    type ServiceAspectFormulaWithTemplate = ServiceAspectFormula & {
        surveyTemplate: SurveyTemplate;
    };
    (data.items as ServiceAspectFormulaWithTemplate[]).map(
        (formula) => (formula.formula = decodeBinary(formula.formula))
    );
    return data.items as ServiceAspectFormulaWithTemplate[];
}

type UpsertInput = {
    table: string;
    data: Array<object> | object;
};

export type UpsertResponse = {
    isSuccess: boolean;
    errorMessage?: string;
    data?: Array<object> | object;
};

export async function upsertDB(
    input: UpsertInput
): Promise<UpsertResponse | [] | string | null> {
    const endpoint = process.env.BACKEND_URL + `/${input.table}`;
    const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(input.data),
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = await res.json();
    return {
        isSuccess: res.ok,
        errorMessage: res.ok ? undefined : res.statusText,
        data: json as Array<object> | object,
    };
}

export async function upsertSurveyTemplate(
    data: TemplateSummary,
    rollback: boolean = true
): Promise<UpsertResponse> {
    const result = (await upsertDB({
        table: `surveyTemplate/upsert?perform_rollback=${rollback}`,
        data: data,
    })) as UpsertResponse;
    return result;
}

export async function upsertServiceAspect(
    data: ServiceAspect
): Promise<UpsertResponse> {
    const result = (await upsertDB({
        table: "serviceAspect",
        data: data,
    })) as UpsertResponse;
    return result;
}

export async function upsertServiceAspectFormula(
    data: ServiceAspectFormula
): Promise<UpsertResponse> {
    const result = (await upsertDB({
        table: "serviceAspectFormula",
        data: { ...data, formula: encodeBinary(data.formula) },
    })) as UpsertResponse;
    return result;
}

export async function upsertSurvey(data: Survey): Promise<UpsertResponse> {
    const result = (await upsertDB({
        table: "survey",
        data: data,
    })) as UpsertResponse;
    return result;
}

type DeleteInput = {
    ids: string[] | number[];
    idLabel?: string;
    table: string;
};

type DeleteOutput = {
    statusCode: number;
    response?: object | [];
};

export async function deleteDB(input: DeleteInput): Promise<DeleteOutput> {
    const endpoint =
        process.env.BACKEND_URL +
        `/${input.table}?ids=${input.ids.join(`ids=`)}${
            input.idLabel ? `&idLabel=${input.idLabel}` : ""
        }`;
    const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return { statusCode: res.status, response: await res.json() };
}

export async function submitSurvey(
    data: CompositeSubmission
): Promise<UpsertResponse> {
    console.log(JSON.stringify(data));
    const result = (await upsertDB({
        table: `submit/${data.surveyId}`,
        data: data,
    })) as UpsertResponse;
    return result;
}

export async function querySubmissionDetails(uuid: string) {
    const result = (await queryDB({
        table: "surveySubmission",
        query: `uuid=eq.${uuid}`,
        fields: "id,uuid,timestamp,answers:submittedAnswer(uuid,value,templateQuestion(text,answerFormat))",
        limit: 1,
    })) as QueryResponse;
    return result;
}

export async function calculateAspectValues({
    surveyTemplateId,
    surveyId,
    routeId,
    tripId,
}: {
    surveyTemplateId: string | number;
    surveyId: string | number;
    routeId?: string[];
    tripId?: string[];
}) {
    const endpoint = `${process.env.BACKEND_URL}/surveyTemplate/${surveyTemplateId}/${surveyId}/calculate`;
    const body = {
        tripId: tripId,
        routeId: routeId,
    };
    const result = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    });
    return result.json();
}
