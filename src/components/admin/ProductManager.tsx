"use client";

import { useCallback, useEffect, useState } from "react";
import { PRODUCT_TIERS, type ProductTierKey } from "@/lib/storeOptions";

interface Product {
  id: string;
  name: string;
  description: string;
  retailer: string;
  url: string;
  priceLabel: string;
  tier: ProductTierKey;
  tags: string[];
  active: boolean;
  sortOrder: number;
  hasImage: boolean;
  updatedAt: string;
}

const EMPTY = {
  name: "",
  description: "",
  retailer: "",
  url: "",
  priceLabel: "",
  tier: "EVERYDAY" as ProductTierKey,
  tags: "",
  active: true,
  sortOrder: 0,
};

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const load = useCallback(() => {
    fetch("/api/admin/products").then((r) => r.json()).then(setProducts);
  }, []);
  useEffect(load, [load]);

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setForm(EMPTY);
    setImage(null);
    setEditingId(null);
    setFileInputKey((k) => k + 1);
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      retailer: p.retailer,
      url: p.url,
      priceLabel: p.priceLabel,
      tier: p.tier,
      tags: p.tags.join(", "),
      active: p.active,
      sortOrder: p.sortOrder,
    });
    setImage(null);
    setMessage(null);
  }

  async function save() {
    setMessage(null);
    const body = new FormData();
    for (const [key, value] of Object.entries(form)) body.append(key, String(value));
    if (image) body.append("image", image);
    const res = await fetch(editingId ? `/api/admin/products/${editingId}` : "/api/admin/products", {
      method: editingId ? "PATCH" : "POST",
      body,
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(result.error ?? "Couldn't save that product.");
      return;
    }
    setMessage(editingId ? "Product updated." : "Product added.");
    reset();
    load();
  }

  async function toggle(p: Product) {
    const body = new FormData();
    body.append("active", String(!p.active));
    await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", body });
    load();
  }

  async function remove(p: Product) {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    if (editingId === p.id) reset();
    load();
  }

  const input = "rounded-lg border border-line px-3 py-1.5 text-sm";

  return (
    <section className="rounded-2xl border border-line p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl text-flamingo">Store products</h2>
        <a href="/store" target="_blank" className="text-sm text-mint underline hover:text-mint-bright">
          View store
        </a>
      </div>
      <p className="mt-1 text-sm text-foreground/70">
        Paste your affiliate link for each product. Customers buy and get it shipped from the retailer.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input className={input} placeholder="Product name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <input className={input} placeholder="Retailer (e.g. Amazon, Manduka)" value={form.retailer} onChange={(e) => set("retailer", e.target.value)} />
        <input className={`${input} sm:col-span-2`} placeholder="Affiliate link (https://…)" value={form.url} onChange={(e) => set("url", e.target.value)} />
        <textarea className={`${input} sm:col-span-2`} rows={2} placeholder="Short description" value={form.description} onChange={(e) => set("description", e.target.value)} />
        <input className={input} placeholder="Price (e.g. $24 or From $80)" value={form.priceLabel} onChange={(e) => set("priceLabel", e.target.value)} />
        <select className={input} value={form.tier} onChange={(e) => set("tier", e.target.value as ProductTierKey)}>
          {Object.entries(PRODUCT_TIERS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <input className={input} placeholder="Hashtags, comma-separated (mats, cork)" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          Order
          <input type="number" className={`${input} w-20`} value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
          <span className="text-xs text-foreground/50">lower shows first</span>
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mr-2">Image{editingId ? " (leave empty to keep the current one)" : ""}:</span>
          <input key={fileInputKey} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
          Show in the store
        </label>
      </div>
      {message && <p className="mt-3 text-sm text-mint">{message}</p>}
      <div className="mt-3 flex gap-2">
        <button onClick={save} className="rounded-full bg-flamingo px-5 py-2 text-sm font-semibold text-ink hover:bg-flamingo-bright">
          {editingId ? "Save changes" : "Add product"}
        </button>
        {editingId && (
          <button onClick={reset} className="rounded-full border border-line px-4 py-2 text-sm hover:bg-surface-2">
            Cancel
          </button>
        )}
      </div>

      <ul className="mt-5 space-y-2">
        {products.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-2 px-3 py-2 text-sm">
            {p.hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded image
              <img src={`/api/products/${p.id}/image?v=${encodeURIComponent(p.updatedAt)}`} alt="" className="h-10 w-10 rounded object-cover" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded bg-surface" aria-hidden>
                🌴
              </span>
            )}
            <span className="flex-1">
              <span className="font-medium">{p.name}</span>
              <span className="text-foreground/60">
                {" "}
                · {PRODUCT_TIERS[p.tier]} · {p.retailer}
                {p.active ? "" : " · hidden"}
              </span>
            </span>
            <span className="flex gap-2">
              <button onClick={() => startEdit(p)} className="rounded-full border border-line px-3 py-1 text-xs hover:bg-surface">
                Edit
              </button>
              <button onClick={() => toggle(p)} className="rounded-full border border-line px-3 py-1 text-xs hover:bg-surface">
                {p.active ? "Hide" : "Show"}
              </button>
              <button onClick={() => remove(p)} className="rounded-full border border-red-400/60 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10">
                Delete
              </button>
            </span>
          </li>
        ))}
        {products.length === 0 && <p className="text-sm text-foreground/60">No products yet.</p>}
      </ul>
    </section>
  );
}
