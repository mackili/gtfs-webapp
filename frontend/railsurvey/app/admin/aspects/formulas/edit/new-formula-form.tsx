"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import {
    ServiceAspect,
    ServiceAspectFormula,
    SurveyTemplate,
    TemplateQuestion,
} from "@/types/surveys";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const formSchema = z.object({
    id: z.number().int().optional(),
    surveyTemplateId: z.coerce.number().int(),
    serviceAspectId: z.coerce.number().int(),
    weight: z.coerce.number().int(),
    formula: z.string(),
});

export default function ServiceAspectFormulaForm({
    defaultValue,
    serviceAspects = [],
    surveyTemplate,
    templateQuestions = [],
    surveyTemplateChoice = [],
    serviceAspectId = undefined,
}: {
    defaultValue?: ServiceAspectFormula;
    serviceAspects: ServiceAspect[];
    surveyTemplate: SurveyTemplate | undefined;
    templateQuestions: TemplateQuestion[];
    surveyTemplateChoice: SurveyTemplate[];
    serviceAspectId?: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const form = useForm<ServiceAspectFormula>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...defaultValue,
            surveyTemplateId: Number(surveyTemplate?.id),
        },
    });

    function onSubmit(values: ServiceAspectFormula) {
        console.log(values);
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
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-8 md:grid-cols-2 w-full"
            >
                <FormField
                    control={form.control}
                    name="surveyTemplateId"
                    render={({ field }) => (
                        <FormItem
                            className={`content-start col-span-full ${
                                defaultValue?.surveyTemplateId ? "hidden" : ""
                            }`}
                        >
                            <FormLabel>Service Aspect</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={
                                    defaultValue?.surveyTemplateId
                                        ? defaultValue?.surveyTemplateId.toString()
                                        : ""
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
                <FormField
                    control={form.control}
                    name="serviceAspectId"
                    render={({ field }) => (
                        <FormItem className="content-start">
                            <FormLabel>Service Aspect</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={
                                    defaultValue?.serviceAspectId
                                        ? defaultValue?.serviceAspectId.toString()
                                        : serviceAspectId || ""
                                }
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {serviceAspects
                                        .filter(
                                            (aspect) =>
                                                typeof aspect.id === "number"
                                        )
                                        .map((aspect, index) => (
                                            <SelectItem
                                                value={aspect.id!.toString()}
                                                key={index}
                                            >
                                                {aspect.title}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                {`Specify Service Aspect measured`}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Weight</FormLabel>
                            <FormControl>
                                <Input placeholder="Aspect Name" {...field} />
                            </FormControl>
                            <FormDescription>
                                {`Specify Aspect's weight in overall score`}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="formula"
                    render={({ field }) => (
                        <FormItem className="col-span-full">
                            <FormLabel>Formula</FormLabel>
                            <FormControl>
                                <Textarea
                                    className="font-mono min-h-48"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Enter formula for service aspect calculation in
                                LUA
                            </FormDescription>
                            <FormMessage />
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
