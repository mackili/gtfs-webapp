import { H1, H2, H3 } from "@/components/ui/typography";
import { querySurveyTemplate } from "@/functions/dbQuery";
import { TemplateSummary } from "@/types/surveys";
import { InfocardsMap } from "@/components/infocards-map";

export const surveyDetailKeys = [
    "id",
    "title",
    "displayTitle",
    "description",
    "type",
];

export const surveyTemplateQuestionKeys = [
    "description",
    "displayOrder",
    "templateSectionId",
    "answerFormat",
    "selectValues",
    "isRequired",
];

export default async function Home({
    params,
}: {
    params: Promise<{ surveyTemplateId: number }>;
}) {
    const { surveyTemplateId } = await params;
    const templateData: TemplateSummary = await querySurveyTemplate(
        surveyTemplateId
    );
    console.log(templateData);
    return (
        <div className="flex flex-col mx-10">
            <div className="flex w-full items-end gap-8 my-10">
                <H1 text={`${templateData?.title || ""}`} />
                <H2 text={templateData?.displayTitle || ""} className="pb-0" />
            </div>
            <div className="grid md:grid-cols-3 w-full my-8 gap-4">
                <div className="md:col-span-2 flex flex-col gap-4">
                    <InfocardsMap
                        title="Details"
                        titleFormat="H3"
                        data={templateData}
                        keysFilter={surveyDetailKeys}
                        className="md:col-span-2"
                    />
                    <div className="transition-all hover:bg-accent/10 hover:text-accent-foreground rounded-md p-4 has-[>svg]:px-4 grid border bg-background shadow-xs gap-4 md:grid-cols-2">
                        <H3
                            text="Questions"
                            className="pb-2 border-b md:col-span-2"
                        />
                        {templateData.templateQuestions?.map(
                            (question, index) => (
                                <InfocardsMap
                                    key={index}
                                    title={question.text}
                                    data={question}
                                    keysFilter={surveyTemplateQuestionKeys}
                                />
                            )
                        )}
                    </div>
                </div>
                <div>
                    <div className="transition-all hover:bg-accent/10 hover:text-accent-foreground rounded-md p-4 has-[>svg]:px-4 flex flex-col border bg-background shadow-xs gap-4">
                        <H3 text="Authors" />
                        {templateData.surveyTemplateAuthors?.map(
                            (author, index) => (
                                <InfocardsMap
                                    key={index}
                                    // @ts-expect-error requested sql result, hence one more depth level
                                    title={`${author.author.firstName} ${author.author.lastName}`}
                                    // @ts-expect-error requested sql result, hence one more depth level
                                    data={author.author}
                                />
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
