"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  name: string;
  size?: number;
  className?: string;
}

/**
 * Remote avatar that degrades to an initials monogram if the image fails to
 * load (offline, blocked host, deleted account). `unoptimized` keeps the
 * fetch in the browser so the server never proxies third-party images.
 */
export function Avatar({ src, name, size = 64, className }: Props) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (failed) {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] font-bold text-accent-fg",
          className,
        )}
      >
        {initials || "?"}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
      className={cn("shrink-0 rounded-full border border-border bg-surface object-cover", className)}
    />
  );
}
