import { H1, H2, H3 } from "@/components/ui/typography";
import { querySurveyTemplate } from "@/functions/dbQuery";
import { TemplateSummary } from "@/types/surveys";
import { InfocardsMap } from "@/components/infocards-map";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { headers } from "next/headers";

export const surveyDetailKeys = [
    "id",
    "title",
    "displayTitle",
    "description",
    "type",
];

export const surveyTemplateQuestionKeys = [
    "id",
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
    const currentPath = (await headers()).get("x-current-path");
    const { surveyTemplateId } = await params;
    const templateData: TemplateSummary = await querySurveyTemplate(
        surveyTemplateId
    );
    return (
        <div className="flex flex-col mx-10">
            <div className="flex flex-col justify-start content-center flex-wrap md:flex-nowrap md:flex-row w-full md:justify-between items-center gap-8 my-10">
                <div className="flex w-full items-end gap-8">
                    <H1
                        text={templateData?.displayTitle || ""}
                        className="pb-0"
                    />
                    <H2
                        text={`${templateData?.title || ""}`}
                        className="pb-0"
                    />
                </div>
                <div className="w-full flex justify-center md:justify-end">
                    <Link href={`/admin/surveys/edit?id=${templateData.id}`}>
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
            <div className="grid md:grid-cols-3 w-full my-8 gap-4">
                <div className="md:col-span-2 flex flex-col gap-4">
                    <InfocardsMap
                        title="Details"
                        titleFormat="H3"
                        // @ts-expect-error its fine
                        data={templateData}
                        keysFilter={surveyDetailKeys}
                        className="md:col-span-2"
                    />
                    <div className="transition-all hover:bg-accent/10 hover:text-accent-foreground rounded-md p-4 has-[>svg]:px-4 grid border bg-background shadow-xs gap-4 md:grid-cols-2">
                        <H3 text="Questions" className="md:col-span-2" />
                        {templateData.templateQuestions
                            ?.sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((question, index) => (
                                <InfocardsMap
                                    key={index}
                                    title={question.text}
                                    // @ts-expect-error its fine
                                    data={question}
                                    keysFilter={surveyTemplateQuestionKeys}
                                />
                            ))}
                    </div>
                    <div className="transition-all hover:bg-accent/10 hover:text-accent-foreground rounded-md p-4 has-[>svg]:px-4 grid border bg-background shadow-xs gap-4">
                        <div className="flex content-center flex-nowrap flex-row w-full justify-between">
                            <H3
                                text="Measured Service Aspects"
                                className="md:col-span-2"
                            />
                            <Link
                                href={{
                                    pathname: "/admin/aspects/formulas/edit",
                                    query: {
                                        surveyTemplateId: surveyTemplateId,
                                    },
                                }}
                            >
                                <Button
                                    variant="outline"
                                    className="cursor-pointer"
                                >
                                    Add
                                </Button>
                            </Link>
                        </div>
                        {(templateData.serviceAspectFormulas || []).map(
                            (serviceAspectFormula, index) => (
                                <InfocardsMap
                                    key={index}
                                    title={
                                        serviceAspectFormula.serviceAspect.title
                                    }
                                    // @ts-expect-error its fine
                                    data={null}
                                    editPath={{
                                        pathname:
                                            "/admin/aspects/formulas/edit",
                                        query: {
                                            surveyTemplateId: surveyTemplateId,
                                            id: serviceAspectFormula.id,
                                        },
                                    }}
                                    deletePath={{
                                        pathname:
                                            "/admin/aspects/formulas/delete",
                                        query: {
                                            retUrl: currentPath || "",
                                            id: String(serviceAspectFormula.id),
                                        },
                                    }}
                                    contentOverride={
                                        <div className="font-mono">
                                            {serviceAspectFormula.formula}
                                        </div>
                                    }
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
