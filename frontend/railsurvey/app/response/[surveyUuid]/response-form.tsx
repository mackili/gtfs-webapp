"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { encodeBinary } from "@/functions/encoder";
import { TemplateQuestion } from "@/types/surveys";

// const yesNoValues = [
//     { value: "true", label: "Yes" },
//     { value: "false", label: "No" },
// ];

export default function SurveyResponseForm({
    questions,
}: {
    questions: TemplateQuestion[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tripId = searchParams.get("tripId");
    const routeId = searchParams.get("routeId");
    const ticketHash = searchParams.get("ticketHash");
    const form = useForm({
        // resolver: standardSchemaResolver(),
    });

    function onSubmit(values: {
        [key: string]:
            | string
            | number
            | object
            | []
            | boolean
            | null
            | undefined;
    }) {
        const params = new URLSearchParams({
            value: encodeBinary(JSON.stringify(values)),
            submitted: "true",
        });
        params.append("isError", "false");
        if (tripId) params.append("tripId", tripId);
        if (routeId) params.append("routeId", routeId);
        if (ticketHash) params.append("ticketHash", ticketHash);
        router.replace(`${pathname}?${params}`);
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-8 w-full"
            >
                {questions
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((question, index) => (
                        <FormField
                            key={index}
                            control={form.control}
                            name={question.id.toString()}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {question.text}
                                        {question.isRequired && (
                                            <span className="text-red-600">
                                                *
                                            </span>
                                        )}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type={question.answerFormat}
                                            min={question.minValue}
                                            max={question.maxValue}
                                            required={question.isRequired}
                                            {...{
                                                ...field,
                                                value:
                                                    field.value === null
                                                        ? undefined
                                                        : field.value,
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {question.description}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                <div className="col-span-full flex gap-8 justify-baseline">
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
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    );
}
