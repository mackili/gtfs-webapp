"use server";
import { SummaryData, AgencySummaryView, AgencyStatic } from "@/types/db";
import { Route, Stops } from "@/types/gtfs";
import { ServiceAspect, TemplateSummary } from "@/types/surveys";

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

type QueryResponseItemBase = Stops | Route | TemplateSummary;

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
        fields: "routeId,routeType,agencyId,routeShortName,routeLongName,routeUrl,routeDesc",
        filter: `route_id=eq.${routeId}`,
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    return data;
}

export async function querySurveyTemplate(surveyTemplateId: number) {
    const queryInput: QueryInput = {
        table: "surveyTemplate",
        fields: "id,title,displayTitle,description,type,surveyTemplateAuthors:surveyTemplateAuthor(author(id,firstName,lastName,institutionName)),templateSections:templateSection(id,displayOrder,title,description,displayNextPage),templateQuestions:templateQuestion(id,displayOrder,text,templateSection_id,answerFormat,isRequired)",
        filter: `id=eq.${surveyTemplateId}`,
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    return data.items[0] as TemplateSummary;
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
    console.log(JSON.stringify(data));
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

export async function queryServiceAspect(serviceAspectId: number) {
    const queryInput: QueryInput = {
        table: "serviceAspect",
        // fields: "id,title,displayTitle,description,type,surveyTemplateAuthors:surveyTemplateAuthor(author(id,firstName,lastName,institutionName)),templateSection(id,displayOrder,title,description,displayNextPage),templateQuestions:templateQuestion(id,displayOrder,text,templateSection_id,answerFormat):templateQuestions",
        filter: `id=eq.${serviceAspectId}`,
    };
    const data: QueryResponse = (await queryDB(queryInput)) as QueryResponse;
    return data.items[0] as ServiceAspect;
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
    console.log(JSON.stringify(data));
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
