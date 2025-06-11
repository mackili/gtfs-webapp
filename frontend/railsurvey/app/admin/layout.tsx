import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import React, { Suspense } from "react";
import Loading from "./loading";
import { headers } from "next/headers";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumb";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const headerList = await headers();
    const pathElements = headerList.get("x-current-path")?.split("/");
    pathElements?.shift();
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <div className="flex my-8 mx-2 items-center">
                    <SidebarTrigger className="px-2 cursor-pointer" />
                    <DynamicBreadcrumb pathElements={pathElements} />
                </div>
                <Suspense fallback={<Loading />}>{children}</Suspense>
            </main>
        </SidebarProvider>
    );
}
