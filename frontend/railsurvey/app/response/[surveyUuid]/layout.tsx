import React, { Suspense } from "react";
import Loading from "./loading";
import { headers } from "next/headers";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const headerList = await headers();
    const pathElements = headerList.get("x-current-path")?.split("/");
    pathElements?.shift();
    return (
        <main className="w-full flex justify-center">
            <Suspense fallback={<Loading />}>{children}</Suspense>
        </main>
    );
}
