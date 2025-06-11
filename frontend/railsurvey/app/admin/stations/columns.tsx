import { ColumnsDefinition } from "@/types/misc";
export const columns: ColumnsDefinition[] = [
    {
        accessorKey: "stopName",
        header: "Stop Name",
        link: true,
    },
    {
        accessorKey: "locationType",
        header: "Stop Type",
        link: false,
    },
    {
        accessorKey: "wheelchairBoarding",
        header: "Wheelchair Boarding",
        link: false,
    },
    {
        accessorKey: "stopId",
        header: "Stop Id",
        link: true,
    },
];
