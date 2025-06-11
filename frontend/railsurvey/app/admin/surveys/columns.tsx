import { ColumnsDefinition } from "@/types/misc";
export const columns: ColumnsDefinition[] = [
    {
        accessorKey: "id",
        header: "Survey Aspect ID",
        link: true,
    },
    {
        accessorKey: "templateTitle",
        header: "Title",
        link: true,
    },
    {
        accessorKey: "displayTitle",
        header: "Display Title",
        link: false,
    },
    {
        accessorKey: "type",
        header: "Type",
        link: false,
    },
];
