"use server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactElement } from "react";
import RealtimeSettings from "./gtfs-rt-settings";

type SettingPickerType = {
    title: string;
    key: string;
    content: string | ReactElement | JSX.Element;
};

export default async function Settings({
    searchParams,
}: {
    searchParams: Promise<{
        [key: string]: string | string[] | undefined;
    }>;
}) {
    const queryParams = await searchParams;
    const settingsPicker: SettingPickerType[] = [
        // {
        //     title: "Import GTFS",
        //     key: "importGtfs",
        //     content: <ImportForm />,
        // },
        {
            title: "Manage GTFS-RT",
            key: "magageRT",
            content: (
                <RealtimeSettings
                    value={queryParams.valueRealtime?.toString()}
                    submitted={queryParams.submitted?.toString() === "true"}
                />
            ),
        },
    ];
    return (
        <div className="w-full m-8 flex gap-8">
            <Tabs defaultValue="magageRT">
                <TabsList>
                    {settingsPicker.map((tab) => (
                        <TabsTrigger
                            className="cursor-pointer"
                            value={tab.key}
                            key={tab.key}
                        >
                            {tab.title}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {settingsPicker.map((tab) => (
                    <TabsContent key={tab.key} value={tab.key} className="my-8">
                        {tab.content}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
