"use client";

import * as React from "react";
import {
    IconCamera,
    IconFileAi,
    IconFileDescription,
    IconHelp,
    IconSearch,
    IconSettings,
} from "@tabler/icons-react";
import {
    CircleGauge,
    House,
    Workflow,
    TrainFront,
    CalendarCheck,
    TrainTrack,
    Code,
    FileQuestion,
    ListStart,
} from "lucide-react";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Home",
            url: "/admin",
            icon: ListStart,
        },
        {
            title: "Dashboard",
            url: "#",
            icon: CircleGauge,
        },
        {
            title: "Stations",
            url: "/admin/stations?limit=9",
            icon: House,
        },
        {
            title: "Routes",
            url: "/admin/routes?limit=9",
            icon: Workflow,
        },
        {
            title: "Trips",
            url: "#",
            icon: CalendarCheck,
        },
        {
            title: "Vehicles",
            url: "#",
            icon: TrainFront,
        },
    ],
    navSecondary: [
        {
            title: "Settings",
            url: "/admin/settings",
            icon: IconSettings,
        },
        {
            title: "Get Help",
            url: "#",
            icon: IconHelp,
        },
        {
            title: "Search",
            url: "#",
            icon: IconSearch,
        },
    ],
    documents: [
        {
            name: "Surveys",
            url: "/admin/surveys?limit=9",
            icon: FileQuestion,
        },
        {
            name: "Calculations",
            url: "#",
            icon: Code,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="py-8">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5 p-4"
                        >
                            <a href="#">
                                <TrainTrack className="!size-6" />
                                <span className="font-semibold text-xl">
                                    Railsurvey
                                </span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavDocuments items={data.documents} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    );
}
