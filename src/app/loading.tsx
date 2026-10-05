import { Skeleton } from "@/components/ui/skeleton";

/** Streaming fallback for the home route. */
export default function Loading() {
  return (
    <main id="main" className="flex-1" aria-busy="true" aria-live="polite">
      <div className="container-x pt-40">
        <Skeleton className="h-7 w-56 rounded-full" />
        <Skeleton className="mt-8 h-20 w-3/4 max-w-3xl" />
        <Skeleton className="mt-4 h-20 w-1/2 max-w-xl" />
        <Skeleton className="mt-8 h-6 w-2/3 max-w-lg" />
        <div className="mt-10 flex gap-3">
          <Skeleton className="h-12 w-40 rounded-full" />
          <Skeleton className="h-12 w-36 rounded-full" />
        </div>
      </div>
    </main>
  );
}
