"use client";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { importGtfs } from "@/functions/importGtfs";
import { useState } from "react";

type FormData = {
    zipFile: File | null;
};

export default function ImportForm() {
    const [error, setError] = useState<undefined | string>(undefined);
    const form = useForm<FormData>({
        defaultValues: {
            zipFile: null,
        },
    });

    async function onSubmit(values: FormData) {
        if (values.zipFile) {
            const res = await importGtfs(values.zipFile);
            console.log(res);
            // if (!res.ok) {
            //     console.error(res.json());
            // }
        }
    }

    return (
        <div>
            <div className="flex w-full max-w-sm items-center gap-4">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid gap-4"
                    >
                        <FormField
                            control={form.control}
                            name="zipFile"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>GTFS zip file</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="zipFile"
                                            type="file"
                                            accept=".zip"
                                            onChange={(e) => {
                                                field.onChange(
                                                    e.target.files?.[0] || null
                                                );
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        ></FormField>
                        <Button type="submit" className="cursor-pointer">
                            Submit file
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
