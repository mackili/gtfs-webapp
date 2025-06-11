import { ColumnsDefinition } from "@/types/misc";
export const columns: ColumnsDefinition[] = [
    {
        accessorKey: "routeShortName",
        header: "Route Name (Short)",
        link: true,
    },
    {
        accessorKey: "routeLongName",
        header: "Route Name (Long)",
        link: false,
    },
    {
        accessorKey: "routeType",
        header: "Route Type",
        link: false,
    },
    {
        accessorKey: "agencyId",
        header: "Agency Id",
        link: false,
    },
    {
        accessorKey: "routeId",
        header: "Route Id",
        link: true,
    },
];
