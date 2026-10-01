"use client";

import { useEffect, useState, useCallback } from "react";
import { CERTIFICATION_KINDS, type CertificationKindKey } from "@/lib/profileOptions";

interface PendingCertification {
  id: string;
  kind: CertificationKindKey;
  fileName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  instructorProfile: { user: { name: string; email: string } };
}
interface AdminClass {
  id: string;
  title: string;
  startTime: string;
  durationMinutes: number;
  mode: string;
  status: string;
  instructor: { name: string; email: string };
  specialties: { id: string; name: string }[];
  audits: { id: string; rating: number; notes: string; flagged: boolean; createdAt: string }[];
  _count: { enrollments: number };
}

export default function AdminDashboard() {
  const [certifications, setCertifications] = useState<PendingCertification[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [auditDrafts, setAuditDrafts] = useState<Record<string, { rating: number; notes: string; flagged: boolean }>>({});

  const loadCertifications = useCallback(() => {
    fetch("/api/admin/certifications").then((r) => r.json()).then(setCertifications);
  }, []);
  const loadClasses = useCallback(() => {
    fetch("/api/admin/classes").then((r) => r.json()).then(setClasses);
  }, []);

  useEffect(() => {
    loadCertifications();
    loadClasses();
  }, [loadCertifications, loadClasses]);

  async function reviewCertification(id: string, decision: "APPROVED" | "REJECTED") {
    const res = await fetch(`/api/admin/certifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    const body = await res.json().catch(() => ({}));
    setMessage(res.ok ? `Certification ${decision.toLowerCase()}.` : body.error ?? "Couldn't update certification.");
    loadCertifications();
  }

  function draftFor(classId: string) {
    return auditDrafts[classId] ?? { rating: 5, notes: "", flagged: false };
  }

  async function submitAudit(classId: string) {
    const draft = draftFor(classId);
    const res = await fetch("/api/admin/audits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classSessionId: classId, ...draft }),
    });
    const body = await res.json().catch(() => ({}));
    setMessage(res.ok ? "Audit saved." : body.error ?? "Couldn't save audit.");
    if (res.ok) {
      setAuditDrafts((prev) => ({ ...prev, [classId]: { rating: 5, notes: "", flagged: false } }));
      loadClasses();
    }
  }

  const pending = certifications.filter((c) => c.status === "PENDING");

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      <h1 className="font-display text-3xl text-mint">Admin dashboard</h1>
      {message && <p className="rounded-lg bg-mint/10 px-4 py-2 text-sm text-mint">{message}</p>}

      <section className="rounded-2xl border border-line p-5">
        <h2 className="font-display text-xl text-flamingo">Certification review</h2>
        {pending.length === 0 && <p className="mt-2 text-sm text-foreground/60">No certifications waiting on review.</p>}
        <ul className="mt-3 space-y-2">
          {pending.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm">
              <span>
                {c.instructorProfile.user.name} ({c.instructorProfile.user.email}) —{" "}
                <span className="font-semibold">{CERTIFICATION_KINDS[c.kind]}</span>: {c.fileName}
              </span>
              <span className="flex gap-2">
                <a
                  href={`/api/certifications/${c.id}/file`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-line px-3 py-1 text-xs hover:bg-surface-2"
                >
                  View file
                </a>
                <button onClick={() => reviewCertification(c.id, "APPROVED")} className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-ink hover:bg-mint-bright">
                  Approve
                </button>
                <button onClick={() => reviewCertification(c.id, "REJECTED")} className="rounded-full border border-red-400/60 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10">
                  Reject
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl text-flamingo">Quality control — recent classes</h2>
        <div className="mt-3 space-y-4">
          {classes.map((c) => {
            const draft = draftFor(c.id);
            return (
              <div key={c.id} className="rounded-2xl border border-line p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg">{c.title}</h3>
                    <p className="text-sm text-foreground/60">
                      {c.instructor.name} · {new Date(c.startTime).toLocaleString()} · {c.durationMinutes} min ·{" "}
                      {c._count.enrollments} booked
                    </p>
                    <p className="text-xs text-foreground/50">{c.specialties.map((s) => s.name).join(", ")}</p>
                  </div>
                </div>

                {c.audits.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-foreground/60">
                    {c.audits.map((a) => (
                      <li key={a.id}>
                        Rating {a.rating}/5 {a.flagged ? "· flagged" : ""} — {a.notes || "no notes"}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select
                    value={draft.rating}
                    onChange={(e) => setAuditDrafts((prev) => ({ ...prev, [c.id]: { ...draft, rating: Number(e.target.value) } }))}
                    className="rounded-lg border border-line px-2 py-1 text-sm"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}/5
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Audit notes"
                    value={draft.notes}
                    onChange={(e) => setAuditDrafts((prev) => ({ ...prev, [c.id]: { ...draft, notes: e.target.value } }))}
                    className="flex-1 rounded-lg border border-line px-2 py-1 text-sm"
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={draft.flagged}
                      onChange={(e) => setAuditDrafts((prev) => ({ ...prev, [c.id]: { ...draft, flagged: e.target.checked } }))}
                    />
                    Flag for follow-up
                  </label>
                  <button onClick={() => submitAudit(c.id)} className="rounded-full bg-flamingo px-3 py-1 text-xs font-semibold text-ink hover:bg-flamingo-bright">
                    Save audit
                  </button>
                </div>
              </div>
            );
          })}
          {classes.length === 0 && <p className="text-foreground/60">No classes yet.</p>}
        </div>
      </section>
    </main>
  );
}
