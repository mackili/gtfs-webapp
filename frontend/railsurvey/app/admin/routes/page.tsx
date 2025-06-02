import { H1 } from "@/components/ui/typography";
import RoutesTable from "./routes-table";

export default async function Home() {
  return (
    <div className="flex flex-col mx-10">
      <div className="grid w-full my-10">
        <H1 text="Routes" />
        <RoutesTable />
      </div>
    </div>
  );
}
