"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import {
  MATCH_PLAYER_LABEL,
  MATCH_PLAYER_STATUSES,
  MATCH_PLAYER_STYLE,
  SELECTED,
  type MatchPlayerStatusKey,
} from "@/lib/bitacora";
import { bt } from "@/lib/bitacoraText";
import { matchResult, tl, type MatchKindKey } from "@/lib/teamLogText";
import type { GridPlayer } from "./AttendanceGrid";

export interface SheetMatch {
  id: string;
  dayLabel: string;
  opponent: string;
  kind: MatchKindKey;
  goalsFor: number;
  goalsAgainst: number;
  penaltiesFor: number | null;
  penaltiesAgainst: number | null;
  status: Record<string, MatchPlayerStatusKey>;
}

type Status = Record<string, Record<string, MatchPlayerStatusKey>>;

/** Blank → Asistió → No asistió → Justificado → No seleccionado → blank. */
function next(s: MatchPlayerStatusKey | undefined): MatchPlayerStatusKey | null {
  if (!s) return MATCH_PLAYER_STATUSES[0];
  const i = MATCH_PLAYER_STATUSES.indexOf(s);
  return i === MATCH_PLAYER_STATUSES.length - 1 ? null : MATCH_PLAYER_STATUSES[i + 1];
}

const KIND_STYLE: Record<MatchKindKey, string> = {
  LEAGUE: "bg-sky-100 text-sky-900",
  FRIENDLY: "bg-violet-100 text-violet-900",
  TOURNAMENT: "bg-pink-100 text-pink-900",
  ASOMEX: "bg-orange-100 text-orange-900",
};
const RESULT_STYLE = { W: "text-emerald-800", D: "text-slate-700", L: "text-rose-800" } as const;

/**
 * B3 as the sheet lays it out: players down, matches across, each cell one
 * player's status for that match; under it, how many played, the result, the
 * goals and the penalty shoot-out. Each tap on a cell saves on its own.
 */
export default function MatchSheet({
  teamId,
  lang,
  roster,
  matches,
}: {
  teamId: string;
  lang: Lang;
  roster: GridPlayer[];
  matches: SheetMatch[];
}) {
  const b = bt(lang).sheet;
  const kinds = tl(lang).matches.kinds;
  const labels = MATCH_PLAYER_LABEL[lang];
  const [status, setStatus] = useState<Status>(() => Object.fromEntries(matches.map((m) => [m.id, m.status])));
  const [error, setError] = useState<string | null>(null);

  async function cycle(matchId: string, userId: string) {
    const to = next(status[matchId]?.[userId]);
    const before = status;
    setStatus((st) => {
      const row = { ...(st[matchId] ?? {}) };
      if (to) row[userId] = to;
      else delete row[userId];
      return { ...st, [matchId]: row };
    });
    setError(null);
    const res = await fetch(`/api/teams/${teamId}/matches/${matchId}/players`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status: to }),
    }).catch(() => null);
    if (!res?.ok) {
      setStatus(before);
      setError(bt(lang).grid.errSave);
    }
  }

  if (matches.length === 0) return <div className="card p-6 text-center text-sm text-slate-600">{b.none}</div>;

  const label = (m: SheetMatch) => `${m.dayLabel} vs ${m.opponent}`;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {MATCH_PLAYER_STATUSES.map((k) => (
          <span key={k} className={`rounded px-2 py-0.5 text-[11px] font-bold ${MATCH_PLAYER_STYLE[k]}`}>
            {labels[k]}
          </span>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="card mt-3 overflow-x-auto">
        <table className="w-full text-sm" data-testid="match-sheet">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] text-slate-500">
              <th className="sticky left-0 z-10 w-8 bg-white px-2 py-2 text-left font-semibold">#</th>
              <th className="sticky left-8 z-10 min-w-40 bg-white px-2 py-2 text-left font-semibold">{tl(lang).common.player}</th>
              {matches.map((m) => (
                <th key={m.id} className="min-w-28 px-1 py-2 text-center align-bottom font-semibold">
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${KIND_STYLE[m.kind]}`}>{kinds[m.kind]}</span>
                  <span className="mt-1 block whitespace-nowrap text-slate-700">{m.dayLabel}</span>
                  <span className="block max-w-32 truncate font-normal" title={m.opponent}>
                    vs {m.opponent}
                  </span>
                </th>
              ))}
              <th className="border-l border-slate-100 px-2 py-2 text-center font-semibold">{b.selected}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roster.map((p) => (
              <tr key={p.userId} data-player={p.name}>
                <td className="sticky left-0 bg-white px-2 py-1.5 tabular-nums text-slate-500">{p.number ?? ""}</td>
                <td className="sticky left-8 bg-white px-2 py-1.5 font-medium">{p.name}</td>
                {matches.map((m) => {
                  const s = status[m.id]?.[p.userId];
                  return (
                    <td key={m.id} className="px-1 py-1 text-center">
                      <button
                        type="button"
                        aria-label={b.cell(p.name, label(m), s ? labels[s] : bt(lang).grid.unmarked)}
                        onClick={() => cycle(m.id, p.userId)}
                        className={`h-8 w-full min-w-24 rounded-md px-1 text-[11px] font-bold transition ${
                          s ? MATCH_PLAYER_STYLE[s] : "border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {s ? labels[s] : "+"}
                      </button>
                    </td>
                  );
                })}
                <td className="border-l border-slate-100 px-2 text-center font-semibold tabular-nums">
                  {matches.filter((m) => {
                    const s = status[m.id]?.[p.userId];
                    return s && SELECTED.has(s);
                  }).length}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 text-xs">
            <tr>
              <th colSpan={2} className="sticky left-0 bg-white px-2 py-1.5 text-left font-semibold text-slate-600">
                {b.attended}
              </th>
              {matches.map((m) => (
                <td key={m.id} className="text-center font-semibold tabular-nums">
                  {Object.values(status[m.id] ?? {}).filter((s) => s === "ASISTIO").length}
                </td>
              ))}
              <td />
            </tr>
            <tr>
              <th colSpan={2} className="sticky left-0 bg-white px-2 py-1.5 text-left font-semibold text-slate-600">
                {b.result}
              </th>
              {matches.map((m) => {
                const r = matchResult(m.goalsFor, m.goalsAgainst);
                return (
                  <td key={m.id} className={`text-center font-bold ${RESULT_STYLE[r]}`}>
                    {b.resultName[r]}
                  </td>
                );
              })}
              <td />
            </tr>
            <tr>
              <th colSpan={2} className="sticky left-0 bg-white px-2 py-1.5 text-left font-semibold text-slate-600">
                {b.goalsFor}
              </th>
              {matches.map((m) => (
                <td key={m.id} className="text-center tabular-nums">
                  {m.goalsFor}
                </td>
              ))}
              <td className="border-l border-slate-100 text-center font-semibold tabular-nums">{matches.reduce((a, m) => a + m.goalsFor, 0)}</td>
            </tr>
            <tr>
              <th colSpan={2} className="sticky left-0 bg-white px-2 py-1.5 text-left font-semibold text-slate-600">
                {b.goalsAgainst}
              </th>
              {matches.map((m) => (
                <td key={m.id} className="text-center tabular-nums">
                  {m.goalsAgainst}
                </td>
              ))}
              <td className="border-l border-slate-100 text-center font-semibold tabular-nums">
                {matches.reduce((a, m) => a + m.goalsAgainst, 0)}
              </td>
            </tr>
            <tr>
              <th colSpan={2} className="sticky left-0 bg-white px-2 py-1.5 text-left font-semibold text-slate-600">
                {b.penalties}
              </th>
              {matches.map((m) => (
                <td key={m.id} className="pb-2 text-center tabular-nums">
                  {m.penaltiesFor != null && m.penaltiesAgainst != null ? `${m.penaltiesFor} – ${m.penaltiesAgainst}` : "–"}
                </td>
              ))}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-600">{b.resultNote}</p>
    </div>
  );
}
