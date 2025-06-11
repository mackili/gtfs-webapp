"use server";
import { H2 } from "@/components/ui/typography";
import ServiceAspectForm from "./new-aspect-form";
import { ServiceAspect } from "@/types/surveys";
import { upsertServiceAspect, UpsertResponse } from "@/functions/dbQuery";
import { redirect } from "next/navigation";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const title = (await searchParams).title;
    const id = (await searchParams).id;
    let result: UpsertResponse = { isSuccess: false, data: undefined };
    try {
        const submitted = (await searchParams).submitted;
        if (submitted === "true" && title) {
            result = await upsertServiceAspect({
                id: id ? Number(id.toString()) : undefined,
                title: title.toString(),
            });
        }
    } catch (error) {
        let errorMessage = "Unknown Error";
        if (error instanceof Error) errorMessage = error.message;
        redirect(
            `/admin/aspects/new?title=${title}&id=${id}&errorMessage=${errorMessage}&submitted=false&isError=true`
        );
    }
    if (result.isSuccess === true) {
        const data = result.data as ServiceAspect[];
        redirect(`/admin/aspects/${data[0].id?.toString()}`);
    }

    return (
        <div className="flex flex-col mx-10">
            <div className="grid w-full my-10">
                <H2
                    text={id ? `Edit ${title}` : "Create a new Service Aspect"}
                />
                <div className="flex gap-4 mt-8 mb-2 justify-left">
                    <ServiceAspectForm
                        defaultValue={{
                            title: title?.toString() || "",
                            id: Number(id),
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
