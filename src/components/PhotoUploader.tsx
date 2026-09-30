"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";

/** Shows the signed-in user's photo with upload / remove controls. */
export default function PhotoUploader({
  userId,
  name,
  hasPhoto,
  note,
  onChange,
}: {
  userId: string;
  name: string;
  hasPhoto: boolean;
  note: string;
  onChange: (hasPhoto: boolean) => void;
}) {
  const [version, setVersion] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setBusy(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/me/photo", { method: "POST", body: formData });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(body.error ?? "Upload failed.");
      return;
    }
    setVersion(Date.now());
    onChange(true);
  }

  async function remove() {
    setError(null);
    const res = await fetch("/api/me/photo", { method: "DELETE" });
    if (res.ok) {
      setVersion(Date.now());
      onChange(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar userId={userId} name={name} size="md" version={version} />
      <div className="text-sm">
        <label className="inline-block cursor-pointer rounded-full border border-line px-4 py-1.5 hover:bg-surface-2">
          {busy ? "Uploading…" : hasPhoto ? "Change photo" : "Upload a photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) upload(file);
            }}
          />
        </label>
        {hasPhoto && (
          <button type="button" onClick={remove} className="ml-2 text-xs text-foreground/60 underline hover:text-flamingo">
            Remove
          </button>
        )}
        <p className="mt-1 text-xs text-foreground/60">{note}</p>
        {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
      </div>
    </div>
  );
}
