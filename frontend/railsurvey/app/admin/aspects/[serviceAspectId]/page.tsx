"use server";
import { H1, H3 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    queryServiceAspect,
    queryServiceAspectFormulaList,
} from "@/functions/dbQuery";
import { InfocardsMap } from "@/components/infocards-map";
import { headers } from "next/headers";

export default async function Page({
    params,
}: {
    params: Promise<{ serviceAspectId: string }>;
}) {
    const { serviceAspectId } = await params;
    const currentPath = (await headers()).get("x-current-path");
    const data = await queryServiceAspect(Number(serviceAspectId));
    const aspectFormulas =
        (await queryServiceAspectFormulaList(Number(serviceAspectId))) || [];
    return (
        <div className="flex flex-col mx-10">
            <div className="flex flex-col justify-start content-center flex-wrap md:flex-nowrap md:flex-row w-full md:justify-between items-baseline gap-8 my-10">
                <div className="w-full flex justify-center md:justify-start">
                    <H1 text={data?.title} />
                </div>
                <div className="w-full flex justify-center md:justify-end">
                    <Link
                        href={`/admin/aspects/new?title=${data.title}&id=${data.id}`}
                    >
                        <Button
                            variant="outline"
                            className="cursor-pointer right-0"
                            size="lg"
                        >
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="transition-all hover:bg-accent/10 hover:text-accent-foreground rounded-md p-4 has-[>svg]:px-4 grid border bg-background shadow-xs gap-4 w-full">
                <div className="flex content-center flex-nowrap flex-row w-full justify-between">
                    <H3 text="Aspect measured by" className="md:col-span-2" />
                    <Link
                        href={{
                            pathname: "/admin/aspects/formulas/edit",
                            query: {
                                serviceAspectId: serviceAspectId,
                            },
                        }}
                    >
                        <Button variant="outline" className="cursor-pointer">
                            Add
                        </Button>
                    </Link>
                </div>
                {aspectFormulas.map((serviceAspectFormula, index) => (
                    <InfocardsMap
                        key={index}
                        title={serviceAspectFormula.surveyTemplate.title}
                        // @ts-expect-error its fine
                        data={null}
                        editPath={{
                            pathname: "/admin/aspects/formulas/edit",
                            query: {
                                surveyTemplateId:
                                    serviceAspectFormula.surveyTemplateId,
                                id: serviceAspectFormula.id,
                            },
                        }}
                        deletePath={{
                            pathname: "/admin/aspects/formulas/delete",
                            query: {
                                retUrl: currentPath || "",
                                id: String(serviceAspectFormula.id),
                            },
                        }}
                        contentOverride={
                            <div className="font-mono grid text-wrap break-all">
                                {serviceAspectFormula.formula}
                            </div>
                        }
                    />
                ))}
            </div>
        </div>
    );
}
