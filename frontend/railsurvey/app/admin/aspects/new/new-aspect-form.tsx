"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { ServiceAspect } from "@/types/surveys";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Aspect Name must be at least 2 characters long.",
    }),
    id: z.number().int().optional(),
});

export default function ServiceAspectForm({
    defaultValue,
}: {
    defaultValue?: ServiceAspect;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const form = useForm<ServiceAspect>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: defaultValue ? defaultValue.title : "",
            id: defaultValue ? defaultValue.id : undefined,
        },
    });

    function onSubmit(values: ServiceAspect) {
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Aspect Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Aspect Name" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the name of a new Service Aspect
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                        <FormItem className="m-0">
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
