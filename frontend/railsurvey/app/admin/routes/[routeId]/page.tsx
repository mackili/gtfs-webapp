import { H1, H2 } from "@/components/ui/typography";
import { Route } from "@/types/gtfs";
import { queryRouteDetails } from "@/functions/dbQuery";

export default async function Home({
  params,
}: {
  params: Promise<{ routeId: string }>;
}) {
  const routeId = (await params).routeId;
  const routeData: Route = (await queryRouteDetails(routeId)).items[0] as Route;
  return (
    <div className="flex flex-col mx-10">
      <div className="flex w-full items-end gap-8 my-10">
        <H1 text={`${routeData.routeShortName || ""}`} />
        <H2 text={routeData.routeLongName || ""} className="pb-0" />
      </div>
    </div>
  );
}
