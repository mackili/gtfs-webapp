"use server";
import { H1 } from "@/components/ui/typography";
import RecordTable from "@/components/records-table";
import { querySurveysTable } from "@/functions/dbQuery";
import { toNumber } from "@/functions/utils";
import { headers } from "next/headers";
import { columns } from "./columns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

    const data = await querySurveysTable({
        order: "timestamp.desc,id.asc",
        limit: numLimit,
        range: range,
    });
    return (
        <div className="flex flex-col mx-10">
            <div className="grid w-full my-10">
                <div className="flex flex-col justify-start content-center flex-wrap md:flex-nowrap md:flex-row w-full md:justify-between items-baseline gap-8">
                    <div className="w-full flex justify-center md:justify-start">
                        <H1 text="Surveys" />
                    </div>
                    <div className="w-full flex justify-center md:justify-end">
                        <Link href={`/admin/research/edit`}>
                            <Button
                                variant="outline"
                                className="cursor-pointer right-0"
                                size="lg"
                            >
                                Add
                            </Button>
                        </Link>
                    </div>
                </div>
                <RecordTable
                    data={data}
                    url={headerList.get("x-current-path")}
                    columns={columns}
                    objectName="survey templates"
                />
            </div>
        </div>
    );
}
