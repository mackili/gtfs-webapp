import TemplateEditor from "@/components/survey-editor";
import { querySurveyTemplate } from "@/functions/dbQuery";
import { upsertSurveyTemplate } from "@/functions/dbQuery";
import {
    templateSummaryToFormData,
    formdataToSurveyTemplate,
} from "@/functions/formdataJson";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { TemplateSummary } from "@/types/surveys";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const headerList = await headers();
    const params = await searchParams;
    let templateId = params.id;
    const data = await querySurveyTemplate(Number(templateId));
    const submitted = params.isSubmitted;
    if (submitted === "true") {
        // eslint-disable-next-line
        const { id, isSubmitted, ...formData } = params;
        try {
            const res = await upsertSurveyTemplate(
                // @ts-expect-error those values are unused
                formdataToSurveyTemplate(formData),
                templateId ? false : true
            );
            if (res.isSuccess) {
                console.log(JSON.stringify(res));
                templateId = (res.data as TemplateSummary).id.toString();
            } else {
                throw new Error(res.errorMessage);
            }
        } catch (error) {
            console.error(error);
            let errorMessage = "Unknown error";
            if (error instanceof Error) errorMessage = error.message;
            redirect(
                `${headerList.get("x-current-path")}?id=${
                    templateId || ""
                }&error=${errorMessage}`
            );
        }
        redirect(`/admin/surveys/${templateId}`);
    }
    return (
        <div className="flex">
            <TemplateEditor
                data={data}
                // @ts-expect-error minor mismatch
                formData={templateSummaryToFormData(data)}
            />
        </div>
    );
}
