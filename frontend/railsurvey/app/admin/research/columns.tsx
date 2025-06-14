import { ColumnsDefinition } from "@/types/misc";
export const columns: ColumnsDefinition[] = [
    {
        accessorKey: "id",
        header: "Survey ID",
        link: true,
    },
    {
        accessorKey: "surveyTemplate.title",
        header: "Survey Template Title",
        link: false,
    },
    {
        accessorKey: "surveyTemplate.displayTitle",
        header: "Survey Template Display Title",
        link: false,
    },
    {
        accessorKey: "surveyTemplateId",
        header: "Survey Template ID",
        link: false,
    },
    {
        accessorKey: "isActive",
        header: "Active",
        link: false,
    },
];
