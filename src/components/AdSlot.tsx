interface AdSlotProps {
  imageUrl?: string;
  linkUrl?: string;
  alt?: string;
}

/**
 * A single, quiet ad placement — part of the future revenue mix alongside
 * commission and merch (see README "Ads & other revenue streams"). Renders
 * nothing at all when unconfigured, rather than a placeholder box, so it's
 * genuinely non-intrusive until there's a real ad to show.
 */
export default function AdSlot({ imageUrl, linkUrl, alt }: AdSlotProps) {
  if (!imageUrl) return null;

  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- external, operator-provided ad creative
    <img src={imageUrl} alt={alt ?? "Sponsored"} className="mx-auto max-h-24 w-full rounded-xl object-cover" />
  );

  return (
    <div className="my-6">
      <p className="mb-1 text-center text-[10px] uppercase tracking-wide text-foreground/40">Sponsored</p>
      {linkUrl ? (
        <a href={linkUrl} target="_blank" rel="noopener noreferrer sponsored">
          {image}
        </a>
      ) : (
        image
      )}
    </div>
  );
}
