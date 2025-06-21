"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { decodeBinary } from "@/functions/encoder";
import RelatimeConnectionForm from "./edit-connection-form";
import {
    queryAgencyDetails,
    queryRealtimeFeeds,
    upsertRealtimeData,
} from "@/functions/dbQuery";
import { RealtimeSourceResult } from "@/types/gtfsrt";

export default async function RealtimeSettings({
    value,
    submitted,
}: {
    value?: string;
    submitted?: boolean;
}) {
    const data: undefined | RealtimeSourceResult = value
        ? JSON.parse(decodeBinary(value))
        : undefined;
    const currentPath = (await headers()).get("x-current-path");
    const agencies = await queryAgencyDetails();
    const realtimeFeeds = await queryRealtimeFeeds();
    if (submitted === true && data) {
        try {
            await upsertRealtimeData(data);
        } catch (error) {
            let errorMessage = "Unknown error";
            if (error instanceof Error) errorMessage = error.message;
            redirect(`${currentPath}?error=${errorMessage}`);
        }
        redirect(`${currentPath}`);
    }
    return (
        <div>
            {(realtimeFeeds || []).map((feed, index) => (
                <RelatimeConnectionForm
                    key={index}
                    defaultValue={feed}
                    agenciesChoice={agencies}
                />
            ))}
        </div>
    );
}
