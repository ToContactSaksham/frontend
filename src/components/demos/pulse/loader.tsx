"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { createInitialState } from "./pulse-dashboard";

function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex gap-3">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-40 rounded-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-2xl" />
      <Skeleton className="h-[30rem] rounded-2xl" />
    </div>
  );
}

const PulseDashboard = dynamic(
  () => import("./pulse-dashboard").then((m) => m.PulseDashboard),
  { ssr: false, loading: () => <DashboardSkeleton /> },
);

/**
 * The dashboard is driven by timers and random data, so it is rendered on
 * the client only; this avoids any server/client markup mismatch.
 */
export function PulseDashboardLoader() {
  const [initial] = useState(createInitialState);
  return <PulseDashboard initial={initial} />;
}
