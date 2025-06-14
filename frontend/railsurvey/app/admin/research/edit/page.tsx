"use server";
import { H2 } from "@/components/ui/typography";
import SurveyForm from "./new-survey-form";
import { Survey, SurveyTemplate } from "@/types/surveys";
import {
    querySurveyDetails,
    queryTemplatesTable,
    upsertSurvey,
} from "@/functions/dbQuery";
import { redirect } from "next/navigation";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined;
    }>;
}) {
    const queryParams = await searchParams;
    const survey = queryParams.id
        ? ((await querySurveyDetails(queryParams.id.toString()))
              .items[0] as Survey)
        : undefined;
    let surveyId = survey?.id;
    const surveyTemplateChoice: SurveyTemplate[] =
        queryParams.surveyTemplateId === undefined
            ? ((await queryTemplatesTable({})).items as SurveyTemplate[])
            : [];

    if (queryParams.submitted === "true") {
        const surveySubmitted: Survey = {
            surveyTemplateId: Number(queryParams.surveyTemplateId),
            id: queryParams.id ? Number(queryParams.id) : undefined,
            isActive: queryParams.isActive === "true",
        };
        if (queryParams.id) surveySubmitted.id = Number(queryParams.id);
        try {
            const res = await upsertSurvey(surveySubmitted);
            if (res.isSuccess !== true) {
                throw new Error(res.errorMessage);
            }
            surveyId = (res.data as Survey[])[0].id;
        } catch (error) {
            redirect(
                `?${queryParams.id ? `id=${queryParams.id}` : ""}&error=${
                    error instanceof Error ? error.message : "Unknown Error"
                }`
            );
        }
        redirect(`/admin/research/${surveyId}`);
    }

    return (
        <div className="flex flex-col mx-10">
            <div className="grid w-full my-10">
                <H2
                    text={
                        queryParams.id
                            ? `Edit ${"title"}`
                            : "Create a new Service Aspect"
                    }
                />
                <div className="flex gap-4 mt-8 mb-2 justify-left">
                    <SurveyForm
                        defaultValue={survey}
                        surveyTemplateChoice={surveyTemplateChoice}
                        surveyTemplateId={Number(queryParams.surveyTemplateId)}
                    />
                </div>
            </div>
        </div>
    );
}
