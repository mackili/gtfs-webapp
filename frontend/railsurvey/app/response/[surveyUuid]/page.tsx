"use server";
import { H1, P } from "@/components/ui/typography";
import {
    querySurveyDetails,
    querySurveyTemplate,
    submitSurvey,
} from "@/functions/dbQuery";
import type {
    Survey,
    SubmittedAnswer,
    CompositeSubmission,
} from "@/types/surveys";
import { redirect } from "next/navigation";
import SurveyResponseForm from "./response-form";
import { decodeBinary } from "@/functions/encoder";

export default async function Survey({
    params,
    searchParams,
}: {
    params: Promise<{ surveyUuid: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const uuid = (await params).surveyUuid;
    const surveyMeta = (await querySurveyDetails({ surveyUuid: uuid }))
        .items[0] as Survey;
    const templateSummary = await querySurveyTemplate(
        surveyMeta.surveyTemplateId
    );
    const query = await searchParams;
    const errorIds = query.errorIds ? query.errorIds.toString().split(",") : [];
    const isError = errorIds.length > 0;
    let submission: CompositeSubmission | undefined = undefined;

    if (query.submitted === "true" && isError === false && query.value) {
        const values = JSON.parse(
            decodeBinary(
                typeof query.value !== "string"
                    ? query.value.toString()
                    : query.value
            )
        );
        const answers = Object.keys(values).map(
            (key) =>
                ({
                    templateQuestionId: key,
                    value: values[key],
                } as SubmittedAnswer)
        );
        const res = await submitSurvey({
            // @ts-expect-error id may be defined if it is resubmitted
            id: submission ? submission.id : undefined,
            // @ts-expect-error this will be always specified, not null
            surveyId: surveyMeta.id,
            routeId: query.routeId?.toString(),
            tripId: query.tripId?.toString(),
            ticketHash: query.ticketHash?.toString(),
            answers: answers,
        });
        submission = res.data as CompositeSubmission;
        redirect(`/response/${uuid}/${submission.uuid}`);
    }
    return (
        <div className="flex w-full flex-col m-10 max-w-256">
            <p className="text-xs opacity-40 font-mono font-extralight">
                {uuid}
            </p>
            <div className="mt-10">
                <H1
                    text={templateSummary.displayTitle || templateSummary.title}
                />
                <P text={templateSummary.description || ""} />
            </div>
            <div className="my-16">
                <SurveyResponseForm
                    questions={templateSummary.templateQuestions || []}
                />
            </div>
        </div>
    );
}
