import { z } from "zod/v4";

export type ColumnsDefinition = {
    accessorKey: string;
    fallbackKey?: string;
    header: string;
    link: boolean;
};

export const calendarDaysRunBool = z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
});
