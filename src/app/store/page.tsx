import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PRODUCT_TIERS, AFFILIATE_DISCLOSURE, type ProductTierKey } from "@/lib/storeOptions";
import AdBar from "@/components/AdBar";

export const metadata: Metadata = {
  title: "Store — Yoga Tropical",
  description: "Curated yoga and wellness gear in three price tiers, shipped straight from trusted retailers.",
};

function storeHref(tier: string | undefined, tag: string | undefined) {
  const params = new URLSearchParams();
  if (tier) params.set("tier", tier);
  if (tag) params.set("tag", tag);
  const query = params.toString();
  return query ? `/store?${query}` : "/store";
}

export default async function StorePage({ searchParams }: PageProps<"/store">) {
  const params = await searchParams;
  const tierParam = typeof params.tier === "string" ? params.tier : undefined;
  const tier = tierParam && tierParam in PRODUCT_TIERS ? (tierParam as ProductTierKey) : undefined;
  const tag = typeof params.tag === "string" ? params.tag : undefined;

  const inTier = await prisma.product.findMany({
    where: { active: true, ...(tier ? { tier } : {}) },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, name: true, description: true, retailer: true, url: true, priceLabel: true, tier: true, tags: true, imagePath: true },
  });
  const allTags = [...new Set(inTier.flatMap((p) => p.tags))].sort();
  const products = tag ? inTier.filter((p) => p.tags.includes(tag)) : inTier;

  const tabs: [string | undefined, string][] = [[undefined, "All"], ...Object.entries(PRODUCT_TIERS)];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-4xl text-mint">The Tropical Shop</h1>
      <p className="mt-3 max-w-2xl text-foreground/80">
        Mats, props, and wellness gear we&apos;d actually use — hand-picked in three price tiers, shipped straight to
        you from retailers around the world.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Price tier">
        {tabs.map(([key, label]) => (
          <Link
            key={label}
            href={storeHref(key, undefined)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
              key === tier ? "border-flamingo bg-flamingo text-ink" : "border-line text-foreground/80 hover:bg-surface-2"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {allTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Filter by tag">
          {allTags.map((t) => (
            <Link
              key={t}
              href={storeHref(tier, t === tag ? undefined : t)}
              className={`rounded-full border px-3 py-0.5 text-xs ${
                t === tag ? "border-mint bg-mint text-ink" : "border-line text-mint hover:bg-surface-2"
              }`}
            >
              #{t}
            </Link>
          ))}
        </div>
      )}

      <AdBar placement="STORE" className="mt-8" />

      {products.length === 0 ? (
        <p className="mt-10 text-foreground/60">
          {inTier.length === 0 ? "Our curated picks are coming soon — check back shortly." : "Nothing matches that tag yet."}
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
              {p.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image served by our own route
                <img src={`/api/products/${p.id}/image`} alt={p.name} className="aspect-[4/3] w-full bg-surface-2 object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-surface-2 text-4xl" aria-hidden>
                  🌴
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-sunset">{PRODUCT_TIERS[p.tier]}</p>
                <h2 className="mt-1 font-display text-lg text-foreground">{p.name}</h2>
                <p className="text-sm text-foreground/60">
                  {p.retailer}
                  {p.priceLabel ? ` · ${p.priceLabel}` : ""}
                </p>
                {p.description && <p className="mt-2 text-sm text-foreground/80">{p.description}</p>}
                {p.tags.length > 0 && (
                  <p className="mt-2 text-xs text-mint">{p.tags.map((t) => `#${t}`).join(" ")}</p>
                )}
                <a
                  href={p.url}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="mt-4 self-start rounded-full bg-flamingo px-4 py-1.5 text-sm font-semibold text-ink hover:bg-flamingo-bright"
                >
                  Shop at {p.retailer} ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-12 text-xs text-foreground/50">{AFFILIATE_DISCLOSURE}</p>
    </main>
  );
}
