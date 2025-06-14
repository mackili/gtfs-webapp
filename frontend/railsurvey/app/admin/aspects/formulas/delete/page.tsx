"use server";
import { deleteDB } from "@/functions/dbQuery";
import { redirect } from "next/navigation";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined;
    }>;
}) {
    const queryParams = await searchParams;
    const retUrl = queryParams.retUrl as string;
    const id = queryParams.id;
    try {
        await deleteDB({
            ids: id ? (id instanceof Array ? id : [id]) : [],
            table: "serviceAspectFormula",
        });
    } catch (error) {
        redirect(
            `${retUrl}?errorMessage=${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
    redirect(retUrl);

    return (
        <div className="flex flex-col mx-10">
            <div className="grid w-full my-10"></div>
        </div>
    );
}
