"use client";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { titleCase } from "@/functions/utils";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DynamicBreadcrumb({
    pathElements,
}: {
    pathElements: string[] | undefined;
}) {
    const pathname = usePathname();
    const [path, setPath] = useState(pathElements);
    useEffect(() => {
        const pathArray = pathname?.split("/");
        pathArray?.shift();
        setPath(pathArray);
    }, [pathname]);
    const makeLink = (indexNumber: number) => {
        const elementsBefore = path?.filter(
            (element, index) => index <= indexNumber
        );
        const linkString = "/" + elementsBefore?.join("/") || "";
        return linkString;
    };
    return (
        <Breadcrumb className="px-2">
            <BreadcrumbList>
                {(path || []).map((element, index) => (
                    <React.Fragment key={index}>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={makeLink(index)}>
                                    {titleCase(element)}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {path?.length && index < path?.length - 1 ? (
                            <BreadcrumbSeparator />
                        ) : null}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
