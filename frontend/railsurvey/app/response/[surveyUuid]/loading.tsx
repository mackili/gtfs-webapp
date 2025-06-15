import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex w-full flex-col mx-10">
      <div className="grid w-full my-10">
        <Skeleton className="h-12 w-48" />
      </div>
      <div>
        <Skeleton className="h-12 w-64 rounded-full" />
      </div>
      <div className="grid my-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-between">
        <Skeleton className="h-64 w-64 rounded-md p-6" />
        <Skeleton className="h-64 w-64 rounded-md p-6" />
        <Skeleton className="h-64 w-64 rounded-md p-6" />
        <Skeleton className="h-64 w-64 rounded-md p-6" />
      </div>
    </div>
  );
}
