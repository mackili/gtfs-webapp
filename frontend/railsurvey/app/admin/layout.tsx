import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React, { Suspense } from "react";
// import { headers } from "next/headers";
import Loading from "./loading";
import Link from "next/link";
import { titleCase } from "@/functions/utils";
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
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <div className="flex my-8 mx-2 items-center">
                    <SidebarTrigger className="px-2 cursor-pointer" />
                    <Breadcrumb className="px-2">
                        <BreadcrumbList>
                            {(pathElements || []).map((element, index) => (
                                <React.Fragment key={index}>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild>
                                            <Link href={"/admin"}>
                                                {titleCase(element)}
                                            </Link>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <Suspense fallback={<Loading />}>{children}</Suspense>
            </main>
        </SidebarProvider>
    );
}
