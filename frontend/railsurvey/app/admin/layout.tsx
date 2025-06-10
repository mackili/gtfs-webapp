import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { Suspense } from "react";
import Loading from "./loading";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <div className="flex my-8 mx-2">
                    <SidebarTrigger className="px-2 cursor-pointer" />
                    <Breadcrumb className="px-2">
                        <BreadcrumbItem>Admin</BreadcrumbItem>
                    </Breadcrumb>
                </div>
                <Suspense fallback={<Loading />}>{children}</Suspense>
            </main>
        </SidebarProvider>
    );
}
