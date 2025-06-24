"use client";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectItem,
    SelectContent,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
    RealtimeSourceResult,
    realtimeSourceResultSchema,
} from "@/types/gtfsrt";
import { Agency } from "@/types/gtfs";
import { encodeBinary } from "@/functions/encoder";

const yesNoValues = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
];

export default function RelatimeConnectionForm({
    defaultValue,
    agenciesChoice = [],
}: {
    defaultValue?: RealtimeSourceResult;
    agenciesChoice?: Agency[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const form = useForm<RealtimeSourceResult>({
        resolver: standardSchemaResolver(realtimeSourceResultSchema),
        defaultValues: defaultValue,
    });

    function onSubmit(values: RealtimeSourceResult) {
        const params = new URLSearchParams({
            valueRealtime: encodeBinary(JSON.stringify(values)),
            submitted: "true",
        });
        params.append("isError", "false");
        router.replace(`${pathname}?${params}`);
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-8 w-full md:grid-cols-2"
            >
                <div className="flex gap-8 flex-col">
                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Url</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Url"
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
                                    Enter URL under which a GTFS-RT feed is
                                    accessible
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="verbose"
                        render={({ field }) => (
                            <FormItem className="content-start col-span-full">
                                <FormLabel>Return Updates to UI</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={
                                        defaultValue?.verbose === true
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
                                        {yesNoValues.map((value, index) => (
                                            <SelectItem
                                                key={index}
                                                value={value.value}
                                            >
                                                {value.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="write"
                        render={({ field }) => (
                            <FormItem className="content-start col-span-full">
                                <FormLabel>Write results to Database</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={
                                        defaultValue?.write === true
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
                                        {yesNoValues.map((value, index) => (
                                            <SelectItem
                                                key={index}
                                                value={value.value}
                                            >
                                                {value.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="batchSize"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Batch Size</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
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
                                    Size of batches for database inserts
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                            <FormItem className="content-start col-span-full">
                                <FormLabel>Activate connection</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={
                                        defaultValue?.active === true
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
                                        {yesNoValues.map((value, index) => (
                                            <SelectItem
                                                key={index}
                                                value={value.value}
                                            >
                                                {value.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="refreshPeriod"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Refresh period</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
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
                                    How often to refresh Realtime Dataset
                                    (seconds)?
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="id"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        type="hidden"
                                        {...{
                                            ...field,
                                            value:
                                                field.value === null
                                                    ? undefined
                                                    : field.value,
                                        }}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex gap-8 flex-col">
                    <FormField
                        control={form.control}
                        name="agencies"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agencies</FormLabel>
                                <div className="flex flex-col gap-2">
                                    {agenciesChoice.map((agency, index) => (
                                        <label
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox
                                                checked={field.value?.some(
                                                    (a) =>
                                                        a.agencyId ===
                                                        agency.agencyId
                                                )}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([
                                                              ...(field.value ||
                                                                  []),
                                                              {
                                                                  agencyId:
                                                                      agency.agencyId,
                                                              },
                                                          ])
                                                        : field.onChange(
                                                              field.value?.filter(
                                                                  (value) =>
                                                                      value.agencyId !==
                                                                      agency.agencyId
                                                              )
                                                          );
                                                }}
                                            />
                                            {agency.agencyName}
                                        </label>
                                    ))}
                                </div>
                                <FormDescription>
                                    Select agencies for this connection.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
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
