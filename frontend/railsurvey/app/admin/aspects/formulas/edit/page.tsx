"use server";
import { H2 } from "@/components/ui/typography";
import {
    queryServiceAspectTable,
    querySurveyTemplate,
    queryTemplatesTable,
} from "@/functions/dbQuery";
import ServiceAspectFormulaForm from "./new-formula-form";
import {
    TemplateSummary,
    TemplateQuestion,
    ServiceAspect,
    ServiceAspectFormula,
    ServiceAspectFormulaWithAspect,
    SurveyTemplate,
} from "@/types/surveys";
import { upsertServiceAspectFormula } from "@/functions/dbQuery";
import { redirect } from "next/navigation";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined;
    }>;
}) {
    const queryParams = await searchParams;
    const templateData: TemplateSummary | undefined =
        queryParams.surveyTemplateId
            ? await querySurveyTemplate(Number(queryParams.surveyTemplateId))
            : undefined;
    const surveyTemplateChoice: SurveyTemplate[] =
        queryParams.surveyTemplateId === undefined
            ? ((await queryTemplatesTable({})).items as SurveyTemplate[])
            : templateData
            ? [templateData]
            : [];
    const serviceAspectFormula: ServiceAspectFormulaWithAspect | undefined =
        templateData?.serviceAspectFormulas
            ?.filter((formula) => formula.id === Number(queryParams.id))
            .map((formula) => {
                formula.surveyTemplateId = Number(templateData.id);
                return formula;
            })[0];
    if (
        serviceAspectFormula?.serviceAspect &&
        serviceAspectFormula.serviceAspect.id
    ) {
        serviceAspectFormula.serviceAspectId =
            serviceAspectFormula.serviceAspect.id;
    }
    const serviceAspects: ServiceAspect[] = (await queryServiceAspectTable({}))
        .items as ServiceAspect[];
    const templateQuestions: TemplateQuestion[] =
        templateData?.templateQuestions || [];

    if (queryParams.submitted === "true") {
        const aspectFormula: ServiceAspectFormula = {
            surveyTemplateId: Number(queryParams.surveyTemplateId),
            serviceAspectId: Number(queryParams.serviceAspectId),
            weight: Number(queryParams.weight || null),
            formula: (queryParams.formula || "").toString(),
        };
        if (queryParams.id) aspectFormula.id = Number(queryParams.id);
        try {
            const res = await upsertServiceAspectFormula(aspectFormula);
            if (res.isSuccess !== true) {
                throw new Error(res.errorMessage);
            }
        } catch (error) {
            redirect(
                `?surveyTemplateId=${queryParams.surveyTemplateId}&error=${
                    error instanceof Error ? error.message : "Unknown Error"
                }`
            );
        }
        redirect(`/admin/surveys/${queryParams.surveyTemplateId}`);
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
                    <ServiceAspectFormulaForm
                        surveyTemplate={templateData}
                        serviceAspects={serviceAspects}
                        templateQuestions={templateQuestions}
                        defaultValue={serviceAspectFormula}
                        surveyTemplateChoice={surveyTemplateChoice}
                        serviceAspectId={queryParams.serviceAspectId?.toString()}
                    />
                </div>
            </div>
        </div>
    );
}
