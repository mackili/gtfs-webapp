import { NextRequest } from "next/server";
import { importGtfs } from "@/functions/importGtfs";

export async function POST(req: NextRequest) {
    console.log("processing");
    const formData = await req.formData();
    const zipFile = formData.get("zipFile");
    if (!(zipFile instanceof File)) {
        throw new Error("zipFile is required and must be a File");
    }
    return await importGtfs(zipFile);
}
