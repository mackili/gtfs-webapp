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
    recordIds.map((id) => {
        res[id] = getValuesById(originalData, id, uniqueProperties);
    });
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
