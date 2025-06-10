import { twMerge } from "tailwind-merge";
import { H1, H2, H3, H4, P } from "./ui/typography";

const DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g;
const PROPERIZE_REGEXP = /\w\S*/g;

function decamelize(str: string) {
    return str.replace(DECAMELIZE_REGEXP, "$1 $2");
}

function titleCase(str: string) {
    return str.replace(
        PROPERIZE_REGEXP,
        (text: string) =>
            text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}

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
    console.log(data);
    console.log(keysFilter);
    return (
        <div
            className={twMerge(
                "transition-all hover:bg-accent/10 hover:text-accent-foreground rounded-md p-4 has-[>svg]:px-4 grid border bg-background shadow-xs flex-1/2 gap-2 sm:grid-cols-2",
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
            <div>
                {Object.keys(data)
                    .filter((key) =>
                        keysFilter ? keysFilter.includes(key) : true
                    )
                    .map((key, index) => (
                        <div key={index} className="flex flex-row">
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
