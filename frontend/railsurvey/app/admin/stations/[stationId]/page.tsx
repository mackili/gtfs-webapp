import { H1 } from "@/components/ui/typography";

export default async function Home({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="flex flex-col mx-10">
      <div className="grid w-full my-10">
        <H1 text="Stations" />
      </div>
    </div>
  );
}
