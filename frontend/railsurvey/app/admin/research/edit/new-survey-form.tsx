"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectItem,
    SelectContent,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Survey, SurveyTemplate } from "@/types/surveys";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const formSchema = z.object({
    id: z.number().int().optional(),
    surveyTemplateId: z.coerce.number().int(),
    isActive: z.preprocess((value) => {
        return value === "true";
    }, z.boolean()),
});

export default function SurveyForm({
    defaultValue,
    surveyTemplateId,
    surveyTemplateChoice = [],
}: {
    defaultValue?: Survey;
    surveyTemplateId?: number;
    surveyTemplateChoice: SurveyTemplate[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const form = useForm<Survey>({
        // @ts-expect-error zod preprocessing used
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...defaultValue,
            surveyTemplateId:
                defaultValue?.surveyTemplateId || surveyTemplateId,
        },
    });

    function onSubmit(values: Survey) {
        const params = new URLSearchParams(
            Object.entries(values)
                .filter(([, value]) => value !== undefined)
                .map(([key, value]) => [key, String(value)])
        );
        params.append("isError", "false");
        params.append("submitted", "true");
        router.replace(`${pathname}?${params}`);
    }

    return (
        <Form {...form}>
            <form
                // @ts-expect-error zod preprocessing used
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-8 md:grid-cols-2 w-full"
            >
                <FormField
                    // @ts-expect-error zod preprocessing used
                    control={form.control}
                    name="surveyTemplateId"
                    render={({ field }) => (
                        <FormItem
                            className={`content-start col-span-full 
                                ${
                                    defaultValue?.surveyTemplateId ||
                                    surveyTemplateId
                                        ? "hidden"
                                        : ""
                                }
                            `}
                        >
                            <FormLabel>Survey Template</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={
                                    defaultValue?.surveyTemplateId
                                        ? defaultValue?.surveyTemplateId.toString()
                                        : surveyTemplateId?.toString() || ""
                                }
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {surveyTemplateChoice.map(
                                        (template, index) => (
                                            <SelectItem
                                                value={template.id!.toString()}
                                                key={index}
                                            >
                                                {template.title}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                {`Specify Survey Template`}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    // @ts-expect-error zod preprocessing used
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="content-start col-span-full">
                            <FormLabel>Is Active?</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={
                                    defaultValue?.isActive === true
                                        ? "true"
                                        : "false"
                                }
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
                <FormField
                    // @ts-expect-error zod preprocessing used
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                        <FormItem className="hidden">
                            <FormControl>
                                <Input type="hidden" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {searchParams.get("isError") &&
                searchParams.get("isError") === "true" ? (
                    <p className="text-red-500 mb-2 font-semibold">
                        {searchParams.get("errorMessage") || ""}
                    </p>
                ) : null}
                <Button
                    type="submit"
                    className="min-w-32"
                    variant={
                        searchParams.get("isError") &&
                        searchParams.get("isError") === "true"
                            ? "destructive"
                            : "default"
                    }
                >
                    Submit
                </Button>
            </form>
        </Form>
    );
}
