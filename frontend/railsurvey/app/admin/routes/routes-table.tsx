"use client";
import { H4 } from "@/components/ui/typography";
import { queryRoutesTable } from "@/functions/dbQuery";
import { columns as originalColumns } from "./columns";
import { DataTable } from "@/components/data-table";
import { Route } from "@/types/gtfs";
import { QueryResponse } from "@/functions/dbQuery";
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

const columns = originalColumns.map((column) => {
  // @ts-expect-error its ok
  if (column.accessorKey === "routeShortName") {
    return {
      ...column,
      cell: ({ row }: { row: { original: Route } }) => (
        <Link
          href={`/admin/routes/${row.original.routeId}`}
          className="hover:underline"
        >
          {row.original.routeShortName}
        </Link>
      ),
    };
  }
  return column;
});

export default function RoutesTable() {
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
  const [routesData, setRoutesData] = useState<QueryResponse | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(
    Number(searchParams.get("limit")) + 1 || 10
  );
  const [range, setRange] = useState<[number, number]>([
    rangeParams[0] || 0,
    (rangeParams[1] ? rangeParams[1] : rangeParams[0] ? rangeParams[0] : 0) +
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
          typeof param.value === "number" ? String(param.value) : param.value
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
        routesData?.totalSize !== "*" && routesData?.totalSize
          ? routesData?.totalSize
          : 0
      );
    } else {
      newRange[0] = Math.max(range[0] + displayLimit, 0);
      newRange[1] = Math.min(
        range[1] + displayLimit,
        routesData?.totalSize !== "*" && routesData?.totalSize
          ? routesData?.totalSize
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
    const fetchRoutesData = async () => {
      const data = await queryRoutesTable({
        order: "routeType.asc",
        limit: displayLimit,
        range: range,
      });
      setRoutesData(data);
    };
    fetchRoutesData();
  }, [displayLimit, range]);

  return (
    <div className="grid grid-cols-1 my-4 w-full">
      <div className="py-4">
        {routesData ? (
          <H4
            text={`Displaying ${
              routesData.itemsStart === routesData.itemsEnd
                ? "all"
                : `${routesData.itemsStart + 1}-${routesData.itemsEnd + 1}`
            } ${
              typeof routesData.totalSize === "number"
                ? `of ${routesData.totalSize}`
                : ""
            } routes`}
          />
        ) : (
          <H4 text="Loading routes..." />
        )}
      </div>
      <div>
        <DataTable
          columns={columns}
          data={routesData ? (routesData.items as Route[]) : []}
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
            disabled={range[1] == routesData?.totalSize}
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
