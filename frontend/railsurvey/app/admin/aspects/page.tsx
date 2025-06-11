"use server";
import { H1 } from "@/components/ui/typography";
import RecordTable from "@/components/records-table";
import { queryServiceAspectTable } from "@/functions/dbQuery";
import { toNumber } from "@/functions/utils";
import { headers } from "next/headers";
import { columns } from "./columns";
export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const {
        rangeTo = undefined,
        limit = undefined,
        rangeFrom = undefined,
    } = await searchParams;
    const headerList = await headers();
    const numRangeFrom = toNumber(rangeFrom, 0);
    const numRangeTo = rangeTo ? toNumber(rangeTo, numRangeFrom) : numRangeFrom;
    const numLimit = toNumber(limit, 1);

    const range: [number, number] = [numRangeFrom, numRangeTo + numLimit - 1];

    const data = await queryServiceAspectTable({
        order: "id.asc",
        limit: numLimit,
        range: range,
    });
    return (
        <div className="flex flex-col mx-10">
            <div className="grid w-full my-10">
                <H1 text="Service aspects" />
                <RecordTable
                    data={data}
                    url={headerList.get("x-current-path")}
                    columns={columns}
                    objectName="service aspects"
                />
            </div>
        </div>
    );
}
