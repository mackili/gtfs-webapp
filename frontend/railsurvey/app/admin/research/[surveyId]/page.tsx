import { H1, H2 } from "@/components/ui/typography";
import {
    calculateAspectValues,
    querySurveyDetails,
    querySurveyTemplate,
} from "@/functions/dbQuery";
import { ServiceAspectResult, Survey, TemplateSummary } from "@/types/surveys";
import { InfocardsMap } from "@/components/infocards-map";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { surveyDetailKeys } from "../../surveys/[surveyTemplateId]/page";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle } from "lucide-react";
import RouteTypeIcon from "../../routes/[routeId]/route-type-icon";

export const surveyKeys = [
    "id",
    "isActive",
    "timestamp",
    "answerCount",
    "uuid",
];

export default async function Home({
    params,
}: {
    params: Promise<{ surveyId: number }>;
}) {
    const { surveyId } = await params;
    const surveyData: Survey = (
        await querySurveyDetails({ surveyId: surveyId })
    ).items[0] as Survey;
    const templateData: TemplateSummary = await querySurveyTemplate(
        surveyData.surveyTemplateId
    );
    const results = (
        await calculateAspectValues({
            surveyTemplateId: surveyData.surveyTemplateId,
            surveyId: surveyId,
        })
    ).items as ServiceAspectResult[];
    console.log(JSON.stringify(results));
    return (
        <div className="flex flex-col mx-10">
            <div className="flex flex-col justify-start content-center flex-wrap md:flex-nowrap md:flex-row w-full md:justify-between items-center gap-8 my-10">
                <div className="flex w-full items-end gap-8 grow">
                    <H1
                        text={surveyData.id?.toString() || ""}
                        className="pb-0"
                    />
                    <H2
                        text={`${templateData.title} (${
                            surveyData.isActive === true ? "Active" : "Inactive"
                        })`}
                        className="pb-0"
                    />
                </div>
                <div className="flex justify-center md:justify-end shrink gap-4">
                    <Link target="_blank" href={`/response/${surveyData.uuid}`}>
                        <Button
                            variant="outline"
                            className="cursor-pointer right-0"
                            size="lg"
                        >
                            Link to
                        </Button>
                    </Link>
                    <Link href={`/admin/research/edit?id=${surveyData.id}`}>
                        <Button
                            variant="outline"
                            className="cursor-pointer right-0"
                            size="lg"
                        >
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="grid md:grid-cols-4 w-full my-4 gap-4">
                <InfocardsMap
                    title="Survey Details"
                    titleFormat="H3"
                    data={{
                        id: surveyData.id,
                        isActive: String(surveyData.isActive),
                        timestamp: surveyData.timestamp
                            ? new Date(surveyData.timestamp).toUTCString()
                            : "",
                        answerCount:
                            surveyData.surveySubmission &&
                            surveyData.surveySubmission[0]
                                ? String(surveyData.surveySubmission[0].count)
                                : undefined,
                        uuid: surveyData.uuid,
                    }}
                    keysFilter={surveyKeys}
                    className="md:col-span-2"
                />
                <Link
                    href={`/admin/surveys/${surveyData.surveyTemplateId}`}
                    className="md:col-span-2"
                >
                    <InfocardsMap
                        title="Survey Template Details"
                        titleFormat="H3"
                        // @ts-expect-error its fine
                        data={templateData}
                        keysFilter={surveyDetailKeys}
                        className="md:col-span-2"
                    />
                </Link>
            </div>
            <div className="grid md:grid-cols-2 w-full my-4 gap-4">
                {results.map((result) => (
                    <InfocardsMap
                        key={result.formulaId}
                        title={result.serviceAspectTitle}
                        data={result}
                        contentOverride={
                            typeof result.value === "string" ||
                            typeof result.value === "number" ? (
                                <H2
                                    text={
                                        typeof result.value === "number"
                                            ? result.value.toString()
                                            : result.value
                                    }
                                />
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <AlertTriangle className="stroke-orange-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {`Error: ${result.value.errorMessage}`}
                                    </TooltipContent>
                                </Tooltip>
                            )
                        }
                    />
                ))}
            </div>
        </div>
    );
}
