import { H1, H2, H3 } from "@/components/ui/typography";
import { querySurveyDetails, querySurveyTemplate } from "@/functions/dbQuery";
import { Survey, TemplateSummary } from "@/types/surveys";
import { InfocardsMap } from "@/components/infocards-map";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { headers } from "next/headers";
import { surveyDetailKeys } from "../../surveys/[surveyTemplateId]/page";

export const surveyKeys = ["id", "isActive", "timestamp", "answerCount"];

export default async function Home({
    params,
}: {
    params: Promise<{ surveyId: number }>;
}) {
    const currentPath = (await headers()).get("x-current-path");
    const { surveyId } = await params;
    const surveyData: Survey = (await querySurveyDetails(surveyId))
        .items[0] as Survey;
    const templateData: TemplateSummary = await querySurveyTemplate(
        surveyData.surveyTemplateId
    );
    console.log(surveyData);
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
                <div className="flex justify-center md:justify-end shrink">
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
        </div>
    );
}
