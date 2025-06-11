import { twMerge } from "tailwind-merge";
import { H1, H2, H3, H4, P } from "./ui/typography";
import { decamelize, titleCase } from "@/functions/utils";

export function InfocardsMap({
    title,
    titleFormat,
    data,
    keysFilter,
    className,
}: {
    title?: string;
    titleFormat?: "H1" | "H2" | "H3" | "H4" | "P";
    data: Record<string, string | number | boolean | undefined | null>;
    keysFilter?: string[];
    className?: string;
}) {
    return (
        <div
            className={twMerge(
                "transition-all hover:bg-accent/10 hover:text-accent-foreground rounded-md p-4 has-[>svg]:px-4 grid border bg-background shadow-xs flex-1/2 gap-2",
                className
            )}
        >
            {title &&
                (() => {
                    switch (titleFormat) {
                        case "H1":
                            return (
                                <H1 text={title} className="col-span-full" />
                            );
                        case "H2":
                            return (
                                <H2 text={title} className="col-span-full" />
                            );
                        case "H3":
                            return (
                                <H3 text={title} className="col-span-full" />
                            );
                        case "H4":
                            return (
                                <H4 text={title} className="col-span-full" />
                            );
                        default:
                            return <P text={title} className="col-span-full" />;
                    }
                })()}
            <div className="gap-1 flex flex-col">
                {Object.keys(data)
                    .filter((key) =>
                        keysFilter ? keysFilter.includes(key) : true
                    )
                    .map((key, index) => (
                        <div key={index} className="flex flex-row w-full">
                            <P
                                text={`${titleCase(decamelize(key))}:`}
                                className="leading-4 text-sm font-light text-primary"
                            />
                            <P
                                text={String(data[key] || "")}
                                className="leading-4 text-sm font-base text-primary [&:not(:first-child)]:mt-0 ml-2"
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
}
