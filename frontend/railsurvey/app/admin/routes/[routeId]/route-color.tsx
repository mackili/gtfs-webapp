import { twMerge } from "tailwind-merge";

export default function RouteColorDot({
    routeColor,
    className,
}: {
    routeColor: string | null | undefined;
    className?: string;
}) {
    const lineColor = {
        backgroundColor: routeColor ? `#${routeColor}` : "transparent",
    };
    return (
        <div
            style={lineColor}
            className={twMerge("rounded-full w-6 h-6", className)}
        />
    );
}
