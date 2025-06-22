"use server";
export type ImportError = {
    errorCode: number;
    errorMessage?: string;
};

export type ImportResponse = {
    responseCode: number;
    responseBody: {
        filename: string;
    };
};

export async function importGtfs(binary: File): Promise<Response> {
    const endpoint = process.env.BACKEND_URL + `/gtfs`;
    const formData = new FormData();
    formData.append("file", binary);

    return await fetch(endpoint, {
        method: "POST",
        body: formData,
    });
}
