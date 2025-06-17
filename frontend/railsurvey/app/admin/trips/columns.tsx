import { ColumnsDefinition } from "@/types/misc";
export const columns: ColumnsDefinition[] = [
    {
        accessorKey: "tripId",
        header: "Trip ID",
        link: true,
    },
    {
        accessorKey: "tripHeadsign",
        header: "Headsign",
        link: true,
    },
    {
        accessorKey: "routes.routeShortName",
        fallbackKey: "routes.routeLongName",
        header: "Route Name",
        link: false,
    },
    {
        accessorKey: "routes.routeId",
        header: "Route ID",
        link: false,
    },
];
