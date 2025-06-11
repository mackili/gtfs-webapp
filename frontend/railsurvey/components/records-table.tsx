"use client";
import { H4 } from "@/components/ui/typography";
import { DataTable } from "@/components/data-table";
import { QueryResponse, QueryResponseItem } from "@/functions/dbQuery";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { SurveyTemplate } from "@/types/surveys";
import { ColumnsDefinition } from "@/types/misc";

const columnsDisplay = (
    url: string | null,
    originalColumns: ColumnsDefinition[]
) =>
    originalColumns.map((column) => {
        if (column.link === true) {
            return {
                ...column,
                cell: ({ row }: { row: { original: QueryResponseItem } }) => (
                    <Link
                        href={`${url || ""}/${row.original.id}`}
                        className="hover:underline"
                    >
                        {(
                            row.original as unknown as Record<
                                string,
                                string | number | null | undefined
                            >
                        )[column.accessorKey] || ""}
                    </Link>
                ),
            };
        }
        return column;
    });

export default function RecordTable({
    data,
    url,
    columns,
    objectName = null,
}: {
    data: QueryResponse;
    url: string | null;
    columns: ColumnsDefinition[];
    objectName: string | null;
}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const rangeParams: [number | null, number | null] = [
        typeof searchParams.get("rangeFrom") === "string"
            ? Number(searchParams.get("rangeFrom"))
            : null,
        typeof searchParams.get("rangeTo") === "string"
            ? Number(searchParams.get("rangeTo"))
            : null,
    ];
    const [templatesData, setTemplatesData] = useState<QueryResponse | null>(
        null
    );
    const [displayLimit, setDisplayLimit] = useState<number>(
        Number(searchParams.get("limit")) + 1 || 10
    );
    const [range, setRange] = useState<[number, number]>([
        rangeParams[0] || 0,
        (rangeParams[1]
            ? rangeParams[1]
            : rangeParams[0]
            ? rangeParams[0]
            : 0) +
            displayLimit -
            1,
    ]);

    const handleParamsChange = (
        params: { key: string; value: string | number | undefined | null }[]
    ) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        params.map((param) => {
            if (param.value) {
                newSearchParams.set(
                    param.key,
                    typeof param.value === "number"
                        ? String(param.value)
                        : param.value
                );
            } else {
                newSearchParams.delete(param.key);
            }
        });
        router.replace(`${pathname}?${newSearchParams}`);
    };

    const handleLimitChange = (newLimit: number) => {
        const newRange: [number, number] = [
            range[0],
            Math.max(range[1] + (newLimit - displayLimit), newLimit),
        ];
        handleParamsChange([
            { key: "rangeFrom", value: newRange[0] },
            { key: "rangeTo", value: newRange[1] },
            { key: "limit", value: newLimit },
        ]);
        setRange(newRange);
        setDisplayLimit(newLimit);
    };
    const handleRangeChange = (action: "decrease" | "increase") => {
        const newRange: [number, number] = [...range];
        if (action === "decrease") {
            newRange[0] = Math.max(range[0] - displayLimit, 0);
            newRange[1] = Math.min(
                range[1] - displayLimit,
                templatesData?.totalSize !== "*" && templatesData?.totalSize
                    ? templatesData?.totalSize
                    : 0
            );
        } else {
            newRange[0] = Math.max(range[0] + displayLimit, 0);
            newRange[1] = Math.min(
                range[1] + displayLimit,
                templatesData?.totalSize !== "*" && templatesData?.totalSize
                    ? templatesData?.totalSize
                    : 0
            );
        }
        handleParamsChange([
            { key: "rangeFrom", value: newRange[0] },
            { key: "rangeTo", value: newRange[1] },
        ]);
        setRange(newRange);
    };

    useEffect(() => {
        setTemplatesData(data);
    }, [data]);

    return (
        <div className="grid grid-cols-1 my-4 w-full">
            <div className="py-4">
                {templatesData ? (
                    <H4
                        text={`Displaying ${
                            templatesData.itemsStart === templatesData.itemsEnd
                                ? "all"
                                : `${templatesData.itemsStart + 1}-${
                                      templatesData.itemsEnd + 1
                                  }`
                        } ${
                            typeof templatesData.totalSize === "number"
                                ? `of ${templatesData.totalSize}`
                                : ""
                        } ${objectName || ""}`}
                    />
                ) : (
                    <H4 text="Loading survey templates..." />
                )}
            </div>
            <div>
                <DataTable
                    columns={columnsDisplay(url, columns)}
                    data={
                        templatesData
                            ? (templatesData.items as SurveyTemplate[])
                            : []
                    }
                />
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Select
                        onValueChange={(value) => {
                            handleLimitChange(Number(value));
                        }}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder={displayLimit} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="9">10</SelectItem>
                            <SelectItem value="19">20</SelectItem>
                            <SelectItem value="49">50</SelectItem>
                            <SelectItem value="99">100</SelectItem>
                            <SelectItem value="199">200</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={range[0] == 0}
                        onClick={() => {
                            handleRangeChange("decrease");
                        }}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={
                            !templatesData?.totalSize ||
                            templatesData?.totalSize === "*" ||
                            range[1] >= templatesData?.totalSize
                        }
                        onClick={() => {
                            handleRangeChange("increase");
                        }}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
