"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { EventDoc } from "@/lib/bitacora";
import { bt } from "@/lib/bitacoraText";
import { tl } from "@/lib/teamLogText";
import { putJson, SaveBadge, useAutosave } from "./useAutosave";

export interface EventResult {
  id: string;
  label: string;
  rival: string;
  won: boolean;
  drawn: boolean;
  score: string;
}

/** S-EVE: one event request, saved as the coach types. */
export default function EventForm({
  teamId,
  eventId,
  lang,
  initial,
  roster,
  played,
  results,
  sportLine,
  coach,
}: {
  teamId: string;
  eventId: string;
  lang: Lang;
  initial: EventDoc;
  roster: { userId: string; name: string; number: number | null }[];
  /** Matches each player played at this event (linked matches, "Asistió"). */
  played: Record<string, number>;
  results: EventResult[];
  sportLine: string;
  coach: string;
}) {
  const t = bt(lang).events;
  const s = tl(lang);
  const m = s.matches;
  const router = useRouter();
  const [doc, setDoc] = useState<EventDoc>(initial);
  const state = useAutosave(doc, (data) => putJson(`/api/teams/${teamId}/events/${eventId}`, data));
  const set = <K extends keyof EventDoc>(k: K, v: EventDoc[K]) => setDoc((d) => ({ ...d, [k]: v }));
  const invited = new Set(doc.invited);
  const outside = new Set(doc.outsideCategory);
  const names = new Map(roster.map((r) => [r.userId, r.name]));
  const callUp = roster.filter((r) => invited.has(r.userId));

  const toggle = (id: string) => {
    if (invited.has(id)) {
      setDoc((d) => ({
        ...d,
        invited: d.invited.filter((x) => x !== id),
        outsideCategory: d.outsideCategory.filter((x) => x !== id),
      }));
    } else if (doc.invited.length < 60) set("invited", [...doc.invited, id]);
  };

  async function remove() {
    if (!window.confirm(t.confirmDelete)) return;
    const res = await fetch(`/api/teams/${teamId}/events/${eventId}`, { method: "DELETE" });
    if (res.ok) {
      router.push(`/teams/${teamId}/events`);
      router.refresh();
    }
  }

  const area = (k: "objective" | "analysis" | "organization", label: string, rows = 3) => (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      <textarea name={k} rows={rows} maxLength={6000} className="input mt-1.5 text-sm" value={doc[k]} onChange={(e) => set(k, e.target.value)} />
    </label>
  );

  const totals = results.reduce(
    (a, r) => ({ pj: a.pj + 1, pg: a.pg + (r.won ? 1 : 0), pe: a.pe + (r.drawn ? 1 : 0), pp: a.pp + (!r.won && !r.drawn ? 1 : 0) }),
    { pj: 0, pg: 0, pe: 0, pp: 0 },
  );

  return (
    <form className="min-w-0 space-y-4" aria-label={doc.name || t.untitled} onSubmit={(e) => e.preventDefault()}>
      <div className="flex justify-end">
        <SaveBadge state={state} lang={lang} />
      </div>
      <section className="card grid gap-3 p-5 sm:grid-cols-3">
        <label className="sm:col-span-2">
          <span className="label">{t.name}</span>
          <input name="name" className="input" placeholder={t.namePh} maxLength={120} value={doc.name} onChange={(e) => set("name", e.target.value)} />
        </label>
        <label>
          <span className="label">{t.requestDate}</span>
          <input name="requestDate" type="date" className="input" value={doc.requestDate} onChange={(e) => set("requestDate", e.target.value)} />
        </label>
        <label>
          <span className="label">{t.dates}</span>
          <input name="dates" className="input" placeholder={t.datesPh} maxLength={80} value={doc.dates} onChange={(e) => set("dates", e.target.value)} />
        </label>
        <p className="text-sm sm:col-span-2 sm:pt-6">{sportLine}</p>
        <div className="sm:col-span-3">{area("objective", t.objective)}</div>
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold">{t.invited}</h2>
          <span className="text-xs text-slate-600">{t.invitedCount(callUp.length - outside.size, outside.size)}</span>
        </div>
        <ul className="mt-2 divide-y divide-slate-100 text-sm">
          {roster.map((r) => {
            const on = invited.has(r.userId);
            return (
              <li key={r.userId} className="flex flex-wrap items-center gap-3 py-1.5">
                <label className="flex min-w-0 flex-1 items-center gap-2">
                  <input type="checkbox" checked={on} onChange={() => toggle(r.userId)} />
                  <span className={on ? "font-semibold" : "text-slate-600"}>
                    {r.number != null && <span className="mr-1 tabular-nums text-slate-500">{r.number}</span>}
                    {r.name}
                  </span>
                </label>
                {on && (
                  <>
                    <label className="flex items-center gap-1.5 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={outside.has(r.userId)}
                        onChange={() =>
                          set(
                            "outsideCategory",
                            outside.has(r.userId) ? doc.outsideCategory.filter((x) => x !== r.userId) : [...doc.outsideCategory, r.userId],
                          )
                        }
                      />
                      {t.outside}
                    </label>
                    <span className="w-24 text-right text-xs tabular-nums text-slate-600" title={t.played}>
                      {m.pj}: {played[r.userId] ?? 0}
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card overflow-x-auto p-5">
        <h2 className="text-sm font-bold">{t.results}</h2>
        <p className="text-xs text-slate-600">{t.resultsSub}</p>
        {results.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">{t.noResults}</p>
        ) : (
          <table className="mt-2 w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="py-2 text-left font-semibold">{t.rival}</th>
                <th className="px-2 font-semibold">{m.pj}</th>
                <th className="px-2 font-semibold">{m.pg}</th>
                <th className="px-2 font-semibold">{m.pe}</th>
                <th className="px-2 font-semibold">{m.pp}</th>
                <th className="py-2 text-left font-semibold">{t.score}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r) => (
                <tr key={r.id}>
                  <td className="py-2">
                    {r.rival} <span className="text-xs text-slate-500">· {r.label}</span>
                  </td>
                  <td className="text-center tabular-nums">1</td>
                  <td className="text-center tabular-nums">{r.won ? 1 : 0}</td>
                  <td className="text-center tabular-nums">{r.drawn ? 1 : 0}</td>
                  <td className="text-center tabular-nums">{!r.won && !r.drawn ? 1 : 0}</td>
                  <td className="py-2 tabular-nums">{r.score}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-2">{s.common.total}</td>
                <td className="text-center tabular-nums">{totals.pj}</td>
                <td className="text-center tabular-nums">{totals.pg}</td>
                <td className="text-center tabular-nums">{totals.pe}</td>
                <td className="text-center tabular-nums">{totals.pp}</td>
                <td />
              </tr>
            </tbody>
          </table>
        )}
      </section>

      <section className="card space-y-5 p-5">
        {area("analysis", t.analysis, 4)}
        {callUp.length > 0 && (
          <div>
            <p className="text-sm font-bold">{t.individual}</p>
            <div className="mt-2 space-y-2">
              {callUp.map((r) => (
                <label key={r.userId} className="grid gap-1 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-3">
                  <span className="pt-2 text-sm font-semibold">{names.get(r.userId)}</span>
                  <textarea
                    rows={2}
                    maxLength={2000}
                    className="input text-sm"
                    value={doc.individual[r.userId] ?? ""}
                    onChange={(e) => set("individual", { ...doc.individual, [r.userId]: e.target.value })}
                  />
                </label>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-sm font-bold">{t.incidents}</p>
          <div className="mt-2 space-y-2">
            {doc.incidents.map((x, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
                <input
                  className="input text-sm"
                  aria-label={`${bt(lang).report.who} ${i + 1}`}
                  placeholder={bt(lang).report.who}
                  maxLength={200}
                  value={x.who}
                  onChange={(e) => set("incidents", doc.incidents.map((y, j) => (j === i ? { ...y, who: e.target.value } : y)))}
                />
                <textarea
                  rows={2}
                  className="input text-sm"
                  aria-label={`${bt(lang).report.what} ${i + 1}`}
                  placeholder={bt(lang).report.what}
                  maxLength={2000}
                  value={x.what}
                  onChange={(e) => set("incidents", doc.incidents.map((y, j) => (j === i ? { ...y, what: e.target.value } : y)))}
                />
                <button type="button" className="btn-ghost px-2 text-xs" onClick={() => set("incidents", doc.incidents.filter((_, j) => j !== i))}>
                  {s.common.delete}
                </button>
              </div>
            ))}
          </div>
          {doc.incidents.length < 3 && (
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-brand hover:underline"
              onClick={() => set("incidents", [...doc.incidents, { who: "", what: "" }])}
            >
              {bt(lang).report.addIncident}
            </button>
          )}
        </div>
        {area("organization", t.organization)}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-sm text-slate-700">{coach}</span>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost text-sm text-rose-800" onClick={remove}>
              {t.delete}
            </button>
            <a href={`/api/teams/${teamId}/export?event=${eventId}`} className="btn-primary text-sm" download>
              {t.download}
            </a>
          </div>
        </div>
      </section>
    </form>
  );
}
