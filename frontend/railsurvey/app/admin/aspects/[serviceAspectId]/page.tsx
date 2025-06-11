"use server";
import { H1 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { queryServiceAspect } from "@/functions/dbQuery";

export default async function Page({
    params,
}: {
    params: Promise<{ serviceAspectId: string }>;
}) {
    const { serviceAspectId } = await params;
    const data = await queryServiceAspect(Number(serviceAspectId));
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
        </div>
    );
}
