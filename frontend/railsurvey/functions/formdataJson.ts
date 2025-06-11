import {
    SurveyTemplate,
    Author,
    TemplateQuestion,
    TemplateSection,
    TemplateSummary,
} from "@/types/surveys";

// Defining formdata keys relevant
const templateKey = "templateInfo";
const templateAuthorKey = "authors";
const templateQuestionKey = "templateQuestions";
const templateSectionKey = "templateSections";

export const formdataToSurveyTemplate = (
    formdata: Record<string, string | number | null | undefined>
): TemplateSummary => {
    const json: TemplateSummary = dataToSurveyTemplate(
        formdata
    ) as TemplateSummary;
    json.surveyTemplateAuthors = filterMatchingKeysByPrefix(
        formdata,
        templateAuthorKey
    ) as Author[] | undefined;
    json.templateQuestions = filterMatchingKeysByPrefix(
        formdata,
        templateQuestionKey
    ) as TemplateQuestion[] | undefined;
    json.templateSections = filterMatchingKeysByPrefix(
        formdata,
        templateSectionKey
    ) as TemplateSection[] | undefined;
    return json;
};

function dataToSurveyTemplate<SurveyTemplate>(
    formdata: Record<string, string | number | null | undefined>
) {
    const filtered = filterMatchingKeysByPrefix(formdata, templateKey);
    console.log(filtered);
    const templateInfo = filtered ? filtered[0] : undefined;
    return templateInfo as SurveyTemplate;
}

function filterMatchingKeysByPrefix(
    data: Record<string, string | number | null | undefined>,
    prefix: string
):
    | SurveyTemplate[]
    | Author[]
    | TemplateQuestion[]
    | TemplateSection[]
    | undefined {
    const originalData = data;
    const keysByPrefix = Object.keys(data).filter((key) =>
        key.startsWith(prefix)
    );
    const filteredData: Record<string, string | number | null | undefined> = {};
    keysByPrefix.forEach((key) => {
        filteredData[key] = data[key];
    });

    const recordIds: (string | number)[] = [];
    const uniqueProperties: string[] = [];
    keysByPrefix.map((key) => {
        const uniqueKey = key.substring(prefix.length).replace(/(:\d+:)/g, "");
        if (!uniqueProperties.includes(uniqueKey)) {
            uniqueProperties.push(uniqueKey);
        }
        const id = getUniqueId(key);
        if (!recordIds.includes(id)) {
            recordIds.push(id);
        }
    });
    const res: Record<string | number, object> = {};
    console.log(uniqueProperties);
    recordIds.map((id) => {
        res[id] = getValuesById(filteredData, id, uniqueProperties);
    });
    console.log(res);
    return Object.values(res).length > 0
        ? (Object.values(res) as
              | SurveyTemplate[]
              | TemplateQuestion[]
              | TemplateSection[]
              | Author[])
        : undefined;
}

function getUniqueId(key: string) {
    const firstColon = key.indexOf(":");
    const secondColon = key.indexOf(":", firstColon + 1);
    return key.substring(firstColon + 1, secondColon);
}

function makeUniqueKey(key: string) {
    const firstColon = key.indexOf(":");
    const secondColon = key.indexOf(":", firstColon + 1);
    return key.substring(secondColon + 1, key.length);
}

function getValuesById(
    data: Record<string, string | number | null | undefined>,
    id: string | number,
    keys: string[]
) {
    const response: Record<string, string | number | null | undefined> = {};
    Object.keys(data).map((key) => {
        console.log(key);
        if (!key.includes(typeof id === "number" ? id.toString() : id)) {
            return;
        }
        const propName = makeUniqueKey(key);
        if (!keys.includes(propName)) {
            return;
        }
        response[propName] = data[key];
    });
    return response;
}

export function templateSummaryToFormData(data: TemplateSummary | undefined) {
    if (!data) return undefined;
    const formdata: Record<string, string | number | null | undefined> = {
        "templateInfo:0:description": data.description,
        "templateInfo:0:displayTitle": data.displayTitle,
        "templateInfo:0:title": data.title,
        "templateInfo:0:type": data.type,
        "templateInfo:0:id": data.id,
    };
    const formatted = {
        ...formdata,
        ...arrayToObject(data.surveyTemplateAuthors, "authors"),
        ...arrayToObject(data.templateQuestions, "templateQuestions"),
        ...arrayToObject(data.templateSections, "templateSections"),
    };
    return Object.fromEntries(
        Object.entries(formatted).filter(
            ([, value]) => value !== null && value !== undefined
        )
    );
}

function arrayToObject(
    data: TemplateQuestion[] | TemplateSection[] | Author[] | undefined,
    table: "templateQuestions" | "templateSections" | "authors"
) {
    const formdata: Record<string, string | number | null | undefined> = {};
    if (!data) return formdata;
    switch (table) {
        case "authors":
            data.map((value) =>
                // @ts-expect-error due to database design
                Object.keys(value.author).map(
                    (key) =>
                        // @ts-expect-error due to database design
                        (formdata[`${table}:${value.author.id}:${key}`] =
                            // @ts-expect-error due to database design
                            value.author[key] || undefined)
                )
            );
            break;

        default:
            data.map((value) =>
                Object.keys(value).map(
                    (key) =>
                        // @ts-expect-error due to database design
                        (formdata[`${table}:${value.id}:${key}`] = value[key])
                )
            );
            break;
    }

    return formdata;
}
