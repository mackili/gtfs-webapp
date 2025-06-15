"use server";

import { InfocardsMap } from "@/components/infocards-map";
import { H1, H2 } from "@/components/ui/typography";
import {
    querySurveyDetails,
    querySurveyTemplate,
    querySubmissionDetails,
} from "@/functions/dbQuery";
import { CompositeSubmission, Survey } from "@/types/surveys";

export default async function Home({
    params,
}: {
    params: Promise<{ surveyUuid: string; submissionUuid: string }>;
}) {
    const { surveyUuid, submissionUuid } = await params;
    const surveyMeta = (await querySurveyDetails({ surveyUuid: surveyUuid }))
        .items[0] as Survey;
    const templateSummary = await querySurveyTemplate(
        surveyMeta.surveyTemplateId
    );
    const submission = (await querySubmissionDetails(submissionUuid))
        .items[0] as CompositeSubmission;
    return (
        <div className="flex w-full flex-col m-10 max-w-256">
            <p className="text-xs opacity-40 font-mono font-extralight">
                {surveyUuid}/{submissionUuid}
            </p>
            <div className="mt-10">
                <H1 text="Your submission" />
            </div>
            <div className="my-10 flex flex-row gap-8 justify-between items-baseline">
                <H2
                    className="pb-0"
                    text={templateSummary.displayTitle || templateSummary.title}
                />
                <p className="text-sm font-light">
                    {new Date(submission.timestamp).toString()}{" "}
                </p>
            </div>
            <div className="flex w-full items-end gap-8 grow">
                {submission.answers.map((answer) => (
                    <InfocardsMap
                        key={answer.uuid}
                        title={answer.templateQuestion?.text}
                        data={{}}
                        contentOverride={<H2 text={answer.value} />}
                    />
                ))}
            </div>
        </div>
    );
}
