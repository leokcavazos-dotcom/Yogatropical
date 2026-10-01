"use client";

import { useEffect, useState } from "react";
import type { AdPlacementKey } from "@/lib/storeOptions";

interface Ad {
  id: string;
  altText: string;
  linkUrl: string;
  updatedAt: string;
}

/**
 * A slim, clearly labeled sponsored banner. Shows one random active ad for
 * its placement (managed in the admin dashboard) and renders nothing at all
 * when there isn't one.
 */
export default function AdBar({ placement, className = "" }: { placement: AdPlacementKey; className?: string }) {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetch(`/api/ads?placement=${placement}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setAd)
      .catch(() => setAd(null));
  }, [placement]);

  if (!ad) return null;

  return (
    <aside aria-label="Sponsored" className={`mx-auto w-full max-w-3xl ${className}`}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-foreground/40">Sponsored</p>
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="block overflow-hidden rounded-xl border border-line bg-surface transition hover:border-flamingo/50"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded creative served by our own route */}
        <img
          src={`/api/ads/${ad.id}/image?v=${encodeURIComponent(ad.updatedAt)}`}
          alt={ad.altText}
          className="mx-auto max-h-28 w-full object-cover"
        />
      </a>
    </aside>
  );
}
