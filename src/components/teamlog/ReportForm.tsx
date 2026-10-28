"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import type { ReportDoc } from "@/lib/bitacora";
import { bt } from "@/lib/bitacoraText";
import { tl } from "@/lib/teamLogText";
import type { TeamRecord } from "@/lib/matchStats";
import { putJson, SaveBadge, useAutosave } from "./useAutosave";

export interface ReportPlayer {
  userId: string;
  name: string;
  number: number | null;
  present: number;
  matches: number;
  grades: { term: string; attitude: number | null; performance: number | null }[];
}

export interface ReportCompetition {
  key: string;
  label: string;
  record: TeamRecord;
}

/**
 * R-FI. The sheet's numbers (players, sessions, matches, each player's
 * attendance and appearances, the competitions table) come from what was
 * recorded; the coach writes the rest, and it saves as they type.
 */
export default function ReportForm({
  teamId,
  year,
  lang,
  initial,
  players,
  sessions,
  matches,
  competitions,
}: {
  teamId: string;
  year: number;
  lang: Lang;
  initial: ReportDoc;
  players: ReportPlayer[];
  sessions: number;
  matches: number;
  competitions: ReportCompetition[];
}) {
  const t = bt(lang).report;
  const s = tl(lang);
  const m = s.matches;
  const [doc, setDoc] = useState<ReportDoc>(initial);
  const state = useAutosave(doc, (data) => putJson(`/api/teams/${teamId}/docs/report`, { year, data }));
  const set = <K extends keyof ReportDoc>(k: K, v: ReportDoc[K]) => setDoc((d) => ({ ...d, [k]: v }));

  const area = (k: "group" | "asomex" | "wentWell" | "notDone" | "suggestions" | "meeting", label: string, rows = 4) => (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      <textarea name={k} rows={rows} maxLength={6000} className="input mt-1.5 text-sm" value={doc[k]} onChange={(e) => set(k, e.target.value)} />
    </label>
  );
  const stat = (label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-700">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="no-print flex justify-end">
        <SaveBadge state={state} lang={lang} />
      </div>

      <section className="card p-5">
        {stat(
          t.started,
          <input
            type="number"
            name="started"
            min={0}
            max={200}
            aria-label={t.started}
            placeholder={String(players.length + doc.bajas.length)}
            className="input w-20 py-1 text-right text-sm"
            value={doc.started ?? ""}
            onChange={(e) => set("started", e.target.value === "" ? null : Math.max(0, Math.min(200, Math.round(Number(e.target.value)))))}
          />,
        )}
        {stat(t.now, players.length)}
        {stat(t.trainings, sessions)}
        {stat(t.matches, matches)}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold">{s.season.list}</h2>
        {players.length === 0 ? (
          <div className="card p-6 text-center text-sm text-slate-600">{s.common.noMembers}</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500">
                  <th className="px-4 py-2 text-left font-semibold">{s.common.player}</th>
                  <th className="px-2 py-2 text-center font-semibold">{s.season.attended}</th>
                  <th className="px-2 py-2 text-center font-semibold">{s.season.matches}</th>
                  {players[0].grades.map((g) => (
                    <th key={g.term} className="px-2 py-2 text-center font-semibold">
                      {g.term}
                      <span className="block font-normal">
                        {bt(lang).evals.attitude} / {bt(lang).evals.performance}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {players.map((p) => (
                  <tr key={p.userId}>
                    <td className="px-4 py-2 font-medium">
                      {p.number != null && <span className="mr-1.5 tabular-nums text-slate-500">{p.number}</span>}
                      {p.name}
                    </td>
                    <td className="px-2 py-2 text-center tabular-nums">
                      {p.present}
                      <span className="text-xs text-slate-500"> / {sessions}</span>
                    </td>
                    <td className="px-2 py-2 text-center tabular-nums">
                      {p.matches}
                      <span className="text-xs text-slate-500"> / {matches}</span>
                    </td>
                    {p.grades.map((g) => (
                      <td key={g.term} className="px-2 py-2 text-center tabular-nums">
                        {g.attitude ?? "–"} / {g.performance ?? "–"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-bold">{t.bajas}</h2>
        <p className="text-xs text-slate-600">{t.bajasSub}</p>
        <div className="mt-3 space-y-2">
          {doc.bajas.map((b, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
              <input
                className="input text-sm"
                aria-label={`${t.bajaName} ${i + 1}`}
                placeholder={t.bajaName}
                maxLength={80}
                value={b.name}
                onChange={(e) => set("bajas", doc.bajas.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              />
              <input
                className="input text-sm"
                aria-label={`${t.bajaReason} ${i + 1}`}
                placeholder={t.bajaReason}
                maxLength={300}
                value={b.reason}
                onChange={(e) => set("bajas", doc.bajas.map((x, j) => (j === i ? { ...x, reason: e.target.value } : x)))}
              />
              <button type="button" className="btn-ghost px-2 text-xs" onClick={() => set("bajas", doc.bajas.filter((_, j) => j !== i))}>
                {s.common.delete}
              </button>
            </div>
          ))}
        </div>
        {doc.bajas.length < 40 && (
          <button type="button" className="mt-2 text-xs font-semibold text-brand hover:underline" onClick={() => set("bajas", [...doc.bajas, { name: "", reason: "" }])}>
            {t.addBaja}
          </button>
        )}
      </section>

      <section className="card overflow-x-auto">
        <h2 className="px-4 pt-4 text-sm font-bold">{t.competitions}</h2>
        {competitions.length === 0 ? (
          <p className="px-4 pb-4 pt-2 text-sm text-slate-600">{m.noMatches}</p>
        ) : (
          <table className="mt-2 w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="px-4 py-2 text-left font-semibold">{m.competition}</th>
                <th className="px-2 py-2 text-center font-semibold">{m.pj}</th>
                <th className="px-2 py-2 text-center font-semibold">{m.pg}</th>
                <th className="px-2 py-2 text-center font-semibold">{m.pe}</th>
                <th className="px-2 py-2 text-center font-semibold">{m.pp}</th>
                <th className="px-4 py-2 text-left font-semibold">{t.place}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {competitions.map((c) => (
                <tr key={c.key}>
                  <td className="px-4 py-2 font-medium">{c.label}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{c.record.played}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{c.record.won}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{c.record.drawn}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{c.record.lost}</td>
                  <td className="px-4 py-1.5">
                    <input
                      className="input py-1 text-sm"
                      aria-label={`${t.place}: ${c.label}`}
                      maxLength={40}
                      value={doc.places[c.key] ?? ""}
                      onChange={(e) => set("places", { ...doc.places, [c.key]: e.target.value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card space-y-5 p-5">
        {area("group", t.group, 5)}
        {area("asomex", t.asomex)}
      </section>

      {players.length > 0 && (
        <section className="card p-5">
          <h2 className="text-sm font-bold">{t.individual}</h2>
          <p className="text-xs text-slate-600">{t.individualSub}</p>
          <div className="mt-3 space-y-2">
            {players.map((p) => (
              <label key={p.userId} className="grid gap-1 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-3">
                <span className="pt-2 text-sm font-semibold">{p.name}</span>
                <textarea
                  rows={2}
                  maxLength={2000}
                  className="input text-sm"
                  value={doc.individual[p.userId] ?? ""}
                  onChange={(e) => set("individual", { ...doc.individual, [p.userId]: e.target.value })}
                />
              </label>
            ))}
          </div>
        </section>
      )}

      <section className="card p-5">
        <h2 className="text-sm font-bold">{t.incidents}</h2>
        <div className="mt-3 space-y-3">
          {doc.incidents.map((x, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
              <input
                className="input text-sm"
                aria-label={`${t.who} ${i + 1}`}
                placeholder={t.who}
                maxLength={200}
                value={x.who}
                onChange={(e) => set("incidents", doc.incidents.map((y, j) => (j === i ? { ...y, who: e.target.value } : y)))}
              />
              <textarea
                rows={2}
                className="input text-sm"
                aria-label={`${t.what} ${i + 1}`}
                placeholder={t.what}
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
            {t.addIncident}
          </button>
        )}
      </section>

      <section className="card space-y-5 p-5">
        {area("wentWell", t.wentWell, 3)}
        {area("notDone", t.notDone, 3)}
        {area("suggestions", t.suggestions, 3)}
        {area("meeting", t.meeting, 3)}
      </section>
    </div>
  );
}
