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
    FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

type FormData = {
    zipFile: File | null;
};

export default function ImportForm() {
    const router = useRouter();
    const form = useForm<FormData>({
        defaultValues: {
            zipFile: null,
        },
    });

    async function onSubmit(values: FormData) {
        if (values.zipFile) {
            const formData = new FormData();
            formData.append("zipFile", values.zipFile);
            const res = await fetch("/api/gtfs", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) {
                form.setError("zipFile", {
                    type: "value",
                    message:
                        JSON.stringify(await res.json(), null, 4) ||
                        res.statusText,
                });
                return;
            }
            router.push("/admin");
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
                                <FormItem className="max-w-256">
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
                                            required={true}
                                        />
                                    </FormControl>
                                    <div className="overflow-scroll">
                                        <pre>
                                            <FormMessage />
                                        </pre>
                                    </div>
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
