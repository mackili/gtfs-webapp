"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Stops } from "@/types/gtfs";

export const columns: ColumnDef<Stops>[] = [
  {
    accessorKey: "stopName",
    header: "Stop Name",
  },
  {
    accessorKey: "locationType",
    header: "Stop Type",
  },
  {
    accessorKey: "wheelchairBoarding",
    header: "Wheelchair Boarding",
  },
  {
    accessorKey: "stopId",
    header: "Stop Id",
  },
];
