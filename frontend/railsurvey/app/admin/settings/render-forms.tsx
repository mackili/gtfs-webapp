"use client";
import { RealtimeSourceResult } from "@/types/gtfsrt";
import RelatimeConnectionForm from "./edit-connection-form";
import { SummaryData } from "@/types/db";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function RenderGtfsRtForms({
    feeds,
    agencies,
}: {
    feeds: RealtimeSourceResult[];
    agencies: SummaryData[];
}) {
    const [feedsArray, setFeeds] = useState<RealtimeSourceResult[]>(feeds);
    const handleAddFeed = () => {
        const newFeeds = [...feedsArray];
        newFeeds.push({} as RealtimeSourceResult);
        setFeeds(newFeeds);
    };
    return (
        <div className="flex gap-8 flex-col">
            <Button variant={"outline"} type="button" onClick={handleAddFeed}>
                Add new
            </Button>
            {feedsArray.map((feed, index) => (
                <RelatimeConnectionForm
                    key={index}
                    defaultValue={feed}
                    agenciesChoice={agencies}
                />
            ))}
        </div>
    );
}
