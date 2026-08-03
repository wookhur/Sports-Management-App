"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { t, type Lang } from "@/lib/i18n";

export interface LinkRow {
  id: string;
  otherId: string;
  otherName: string;
  otherEmail: string;
  /** True when the signed-in user is the one who asked. */
  mine: boolean;
}

export default function ConnectionRequests({
  lang,
  role,
  incoming,
  outgoing,
  active,
}: {
  lang: Lang;
  role: "ATHLETE" | "COACH";
  incoming: LinkRow[];
  outgoing: LinkRow[];
  active: LinkRow[];
}) {
  const s = t(lang).connect;
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function respond(id: string, accept: boolean) {
    setBusy(id);
    await fetch("/api/connections/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, accept }),
    }).catch(() => {});
    setBusy(null);
    startTransition(() => router.refresh());
  }

  async function remove(otherId: string) {
    setBusy(otherId);
    await fetch(`/api/connections?id=${encodeURIComponent(otherId)}`, { method: "DELETE" }).catch(() => {});
    setBusy(null);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      {/* Incoming — the only place consent is actually given. */}
      <section className="card p-5">
        <h2 className="font-bold">{s.incomingHeading}</h2>
        {incoming.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">
            {role === "COACH" ? s.incomingEmptyCoach : s.incomingEmptyAthlete}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {incoming.map((r) => (
              <li key={r.id} className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <p className="text-sm font-semibold">
                  {role === "COACH" ? s.askedYouAthlete(r.otherName) : s.askedYouCoach(r.otherName)}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{r.otherEmail}</p>
                <p className="mt-2 text-xs text-slate-500">ⓘ {s.consentNote}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" disabled={busy === r.id} onClick={() => respond(r.id, true)} className="btn-primary px-4 py-2 text-xs">
                    {s.accept}
                  </button>
                  <button type="button" disabled={busy === r.id} onClick={() => respond(r.id, false)} className="btn-ghost px-4 py-2 text-xs">
                    {s.decline}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <h2 className="font-bold">{s.outgoingHeading}</h2>
        {outgoing.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">{s.outgoingEmpty}</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {outgoing.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div>
                  <p className="text-sm font-medium">{r.otherName}</p>
                  <p className="text-xs text-slate-400">{s.waitingOn(r.otherName)}</p>
                </div>
                <button type="button" disabled={busy === r.otherId} onClick={() => remove(r.otherId)} className="text-xs font-semibold text-slate-400 hover:text-red-600">
                  {s.cancel}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <h2 className="font-bold">{s.activeHeading}</h2>
        {active.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">{s.activeEmpty}</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {active.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div>
                  <p className="text-sm font-medium">{r.otherName}</p>
                  <p className="text-xs text-slate-400">{r.otherEmail}</p>
                </div>
                <button type="button" disabled={busy === r.otherId} onClick={() => remove(r.otherId)} className="text-xs font-semibold text-slate-400 hover:text-red-600">
                  {s.remove}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
