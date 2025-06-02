"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Route } from "@/types/gtfs";

export const columns: ColumnDef<Route>[] = [
  {
    accessorKey: "routeShortName",
    header: "Route Name (Short)",
  },
  {
    accessorKey: "routeLongName",
    header: "Route Name (Long)",
  },
  {
    accessorKey: "routeType",
    header: "Route Type",
  },
  {
    accessorKey: "agencyId",
    header: "Agency Id",
  },
  {
    accessorKey: "routeId",
    header: "Route Id",
  },
];
