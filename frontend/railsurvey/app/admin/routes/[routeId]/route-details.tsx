import { RouteDetailsView } from "@/types/gtfs";
import { InfocardsMap } from "@/components/infocards-map";
import { routeDetailsSchema } from "@/types/gtfs";

export default async function RouteDetails({
    data,
    className,
}: {
    data: RouteDetailsView;
    className?: string;
}) {
    const parsedData = routeDetailsSchema.safeParse({
        ...data,
        agencyName: data.agency.agencyName,
    });
    return (
        <InfocardsMap
            className={className}
            // title={(data.routeShortName || data.routeLongName)?.toString()}
            data={parsedData.success && parsedData.data}
            columns={2}
        />
    );
}
