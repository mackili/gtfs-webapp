import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { H2 } from "./ui/typography";
import { AlertTriangle } from "lucide-react";
import { ServiceAspectResult } from "@/types/surveys";

export default function AspectValueDisplay({
    aspect,
}: {
    aspect: ServiceAspectResult;
}) {
    return typeof aspect.value === "string" ||
        typeof aspect.value === "number" ? (
        <H2
            text={
                typeof aspect.value === "number"
                    ? aspect.value.toString()
                    : aspect.value
            }
        />
    ) : (
        <Tooltip>
            <TooltipTrigger>
                <AlertTriangle className="stroke-orange-500" />
            </TooltipTrigger>
            <TooltipContent>
                {`Error: ${aspect.value.errorMessage}`}
            </TooltipContent>
        </Tooltip>
    );
}
