import { H1, H2, H3, H4 } from "@/components/ui/typography";
import { Agency } from "@/types/gtfs";

interface SummaryData extends Agency {
  statistics: Array<{
    id: string;
    title: string;
    value: string | number;
  }> | null;
}

const summary: SummaryData[] = [
  {
    agencyId: "A1",
    agencyName: "AgencyName",
    agencyUrl: "www.google.com",
    agencyTimezone: "Europe/Vienna",
    statistics: [{ id: "stationsCount", title: "Stations", value: 134 }],
  },
];

export default function Home() {
  return (
    <div className="flex w-full flex-col mx-10">
      <div className="grid w-full my-10">
        <H1 text="Welcome!" />
      </div>
      {summary.map((agency) => (
        <div key={agency.agencyId}>
          <H4 key={agency.agencyName} text={agency.agencyName} />
          <div
            key={agency.agencyId}
            className="grid my-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-between"
          >
            {agency.statistics &&
              agency.statistics.map((statistic) => (
                <div
                  key={statistic.id}
                  className="h-64 w-64 transition-all hover:bg-accent hover:text-accent-foreground rounded-md p-6 has-[>svg]:px-4 flex flex-col justify-center-safe content-center-safe border bg-background shadow-xs"
                >
                  <H3 key={statistic.id + "title"} text={statistic.title} />
                  <H2
                    key={statistic.id + "value"}
                    text={
                      typeof statistic.value == "number"
                        ? statistic.value.toString()
                        : statistic.value
                    }
                  />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
