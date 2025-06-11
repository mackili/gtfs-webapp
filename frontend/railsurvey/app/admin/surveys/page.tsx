import { H1 } from "@/components/ui/typography";
import TemplatesTable from "./templates-table";

export default async function Home() {
    return (
        <div className="flex flex-col mx-10">
            <div className="grid w-full my-10">
                <H1 text="Survey templates" />
                <TemplatesTable />
            </div>
        </div>
    );
}
