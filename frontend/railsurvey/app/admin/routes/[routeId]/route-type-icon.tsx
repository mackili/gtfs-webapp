import {
    TramFront,
    TrainFrontTunnel,
    Bus,
    Ship,
    CableCar,
    Mountain,
    RailSymbol,
} from "lucide-react";

export default function RouteTypeIcon({
    routeType,
    className,
}: {
    routeType: number;
    className?: string;
}) {
    switch (routeType) {
        case 0:
            return <TramFront className={className} />;
        case 1:
            return <TramFront className={className} />;
        case 2:
            return <TrainFrontTunnel className={className} />;
        case 3:
            return <Bus className={className} />;
        case 4:
            return <Ship className={className} />;
        case 5:
            return <TramFront className={className} />;
        case 6:
            return <CableCar className={className} />;
        case 7:
            return <Mountain className={className} />;
        case 11:
            return <Bus className={className} />;
        default:
            return <RailSymbol className={className} />;
    }
}
