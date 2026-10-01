"use client";

import { useCallback, useEffect, useState } from "react";
import { AD_PLACEMENTS, type AdPlacementKey } from "@/lib/storeOptions";

interface Ad {
  id: string;
  altText: string;
  linkUrl: string;
  placements: AdPlacementKey[];
  active: boolean;
  updatedAt: string;
}

const EMPTY = { altText: "", linkUrl: "", placements: ["HOME", "BROWSE", "STORE"] as AdPlacementKey[], active: true };

export default function AdManager() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const load = useCallback(() => {
    fetch("/api/admin/ads").then((r) => r.json()).then(setAds);
  }, []);
  useEffect(load, [load]);

  function reset() {
    setForm(EMPTY);
    setImage(null);
    setEditingId(null);
    setFileInputKey((k) => k + 1);
  }

  function togglePlacement(key: AdPlacementKey) {
    setForm((prev) => ({
      ...prev,
      placements: prev.placements.includes(key) ? prev.placements.filter((p) => p !== key) : [...prev.placements, key],
    }));
  }

  async function save() {
    setMessage(null);
    const body = new FormData();
    body.append("altText", form.altText);
    body.append("linkUrl", form.linkUrl);
    body.append("active", String(form.active));
    body.append("placements_present", "1");
    form.placements.forEach((p) => body.append("placements", p));
    if (image) body.append("image", image);
    const res = await fetch(editingId ? `/api/admin/ads/${editingId}` : "/api/admin/ads", {
      method: editingId ? "PATCH" : "POST",
      body,
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(result.error ?? "Couldn't save that ad.");
      return;
    }
    setMessage(editingId ? "Ad updated." : "Ad added.");
    reset();
    load();
  }

  async function toggle(ad: Ad) {
    const body = new FormData();
    body.append("active", String(!ad.active));
    await fetch(`/api/admin/ads/${ad.id}`, { method: "PATCH", body });
    load();
  }

  async function remove(ad: Ad) {
    if (!window.confirm(`Delete the "${ad.altText}" ad?`)) return;
    await fetch(`/api/admin/ads/${ad.id}`, { method: "DELETE" });
    if (editingId === ad.id) reset();
    load();
  }

  const input = "rounded-lg border border-line px-3 py-1.5 text-sm";

  return (
    <section className="rounded-2xl border border-line p-5">
      <h2 className="font-display text-xl text-flamingo">Ads</h2>
      <p className="mt-1 text-sm text-foreground/70">
        Wide banner images work best (about 1200 × 200). Every ad is labeled &ldquo;Sponsored.&rdquo; Keep it
        recovery-safe: no alcohol, gambling, cannabis, diet pills, or anything that could hurt someone&apos;s
        sobriety.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input className={input} placeholder="What the ad says (for screen readers)" value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} />
        <input className={input} placeholder="Link (https://…)" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
        <div className="flex flex-wrap items-center gap-3 text-sm sm:col-span-2">
          <span>Show on:</span>
          {Object.entries(AD_PLACEMENTS).map(([key, label]) => (
            <label key={key} className="flex items-center gap-1">
              <input type="checkbox" checked={form.placements.includes(key as AdPlacementKey)} onChange={() => togglePlacement(key as AdPlacementKey)} />
              {label}
            </label>
          ))}
        </div>
        <label className="text-sm sm:col-span-2">
          <span className="mr-2">Image{editingId ? " (leave empty to keep the current one)" : ""}:</span>
          <input key={fileInputKey} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Running
        </label>
      </div>
      {message && <p className="mt-3 text-sm text-mint">{message}</p>}
      <div className="mt-3 flex gap-2">
        <button onClick={save} className="rounded-full bg-flamingo px-5 py-2 text-sm font-semibold text-ink hover:bg-flamingo-bright">
          {editingId ? "Save changes" : "Add ad"}
        </button>
        {editingId && (
          <button onClick={reset} className="rounded-full border border-line px-4 py-2 text-sm hover:bg-surface-2">
            Cancel
          </button>
        )}
      </div>

      <ul className="mt-5 space-y-2">
        {ads.map((ad) => (
          <li key={ad.id} className="rounded-lg bg-surface-2 p-3 text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded image */}
            <img src={`/api/ads/${ad.id}/image?v=${encodeURIComponent(ad.updatedAt)}`} alt={ad.altText} className="max-h-16 w-full rounded object-cover" />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="flex-1">
                <span className="font-medium">{ad.altText}</span>
                <span className="text-foreground/60">
                  {" "}
                  · {ad.placements.map((p) => AD_PLACEMENTS[p]).join(", ")}
                  {ad.active ? "" : " · paused"}
                </span>
              </span>
              <button
                onClick={() => {
                  setEditingId(ad.id);
                  setForm({ altText: ad.altText, linkUrl: ad.linkUrl, placements: ad.placements, active: ad.active });
                  setMessage(null);
                }}
                className="rounded-full border border-line px-3 py-1 text-xs hover:bg-surface"
              >
                Edit
              </button>
              <button onClick={() => toggle(ad)} className="rounded-full border border-line px-3 py-1 text-xs hover:bg-surface">
                {ad.active ? "Pause" : "Run"}
              </button>
              <button onClick={() => remove(ad)} className="rounded-full border border-red-400/60 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10">
                Delete
              </button>
            </div>
          </li>
        ))}
        {ads.length === 0 && <p className="text-sm text-foreground/60">No ads yet — the ad bar stays hidden until you add one.</p>}
      </ul>
    </section>
  );
}
