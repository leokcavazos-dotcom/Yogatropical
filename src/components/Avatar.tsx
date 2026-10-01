"use client";

import { useState } from "react";

const SIZES = { sm: "h-10 w-10 text-sm", md: "h-16 w-16 text-xl", lg: "h-28 w-28 text-4xl" } as const;

/** A user's photo from /api/users/[id]/photo, falling back to their initials when there isn't one. */
export default function Avatar({
  userId,
  name,
  size = "sm",
  version,
}: {
  userId: string;
  name: string;
  size?: keyof typeof SIZES;
  version?: string | number;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = `/api/users/${userId}/photo${version ? `?v=${version}` : ""}`;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (failedSrc === src) {
    return (
      <span
        aria-hidden
        className={`${SIZES[size]} inline-flex shrink-0 items-center justify-center rounded-full bg-surface-2 font-display text-mint`}
      >
        {initials || "?"}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- served by our own access-checked API route
    <img
      src={src}
      alt={`Photo of ${name}`}
      onError={() => setFailedSrc(src)}
      className={`${SIZES[size]} shrink-0 rounded-full border border-line object-cover`}
    />
  );
}
