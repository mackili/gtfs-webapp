"use server";
import { H1, H2, H3, H4 } from "@/components/ui/typography";
import { queryAgencyDetails } from "@/functions/dbQuery";
import Link from "next/link";

const sortAlphabetically = (a: string, b: string) => {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
};

export default async function Home() {
    const summary = await queryAgencyDetails();
    return (
        <div className="flex flex-col mx-10">
            <div className="grid w-full my-10">
                <H1 text="Welcome!" />
            </div>
            {summary
                .sort((a, b) => sortAlphabetically(a.agencyName, b.agencyName))
                .map((agency) => (
                    <div key={agency.agencyId} className="flex flex-col mb-8">
                        <H3 key={agency.agencyName} text={agency.agencyName} />
                        <div
                            key={agency.agencyId}
                            className="grid my-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-between justify-items-stretch"
                        >
                            {agency.statistics &&
                                agency.statistics.map((statistic) => (
                                    <Link
                                        key={statistic.id}
                                        href={`/admin${
                                            statistic.id === "routeCount"
                                                ? `/routes?limit=9&agencyId=${agency.agencyId}`
                                                : statistic.id === "tripsCount"
                                                ? `/trips?limit=9&agencyId=${agency.agencyId}`
                                                : ""
                                        }`}
                                    >
                                        <div className="h-64 w-64 transition-all hover:bg-accent hover:text-accent-foreground rounded-md p-6 has-[>svg]:px-4 flex flex-col justify-center-safe content-center-safe border bg-background shadow-xs">
                                            <H2
                                                key={statistic.id + "value"}
                                                text={
                                                    typeof statistic.value ==
                                                    "number"
                                                        ? statistic.value.toString()
                                                        : statistic.value
                                                }
                                            />
                                            <H4
                                                key={statistic.id + "title"}
                                                text={statistic.title}
                                            />
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    </div>
                ))}
        </div>
    );
}
