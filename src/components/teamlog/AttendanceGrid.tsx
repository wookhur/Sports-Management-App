"use client";

import { useMemo, useState } from "react";
import type { Lang } from "@/lib/i18n";
import {
  ATTENDANCE_LABEL,
  ATTENDANCE_STATUSES,
  ATTENDANCE_STYLE,
  ATTENDED,
  semesterPercent,
  type AttendanceStatusKey,
} from "@/lib/bitacora";
import { bt } from "@/lib/bitacoraText";
import { tl } from "@/lib/teamLogText";

export interface GridPlayer {
  userId: string;
  name: string;
  number: number | null;
}

type Marks = Record<string, Record<string, AttendanceStatusKey>>;

/** Blank → A → F → T → I → J → blank, the order of the sheet's dropdown. */
function next(s: AttendanceStatusKey | undefined): AttendanceStatusKey | null {
  if (!s) return ATTENDANCE_STATUSES[0];
  const i = ATTENDANCE_STATUSES.indexOf(s);
  return i === ATTENDANCE_STATUSES.length - 1 ? null : ATTENDANCE_STATUSES[i + 1];
}

/**
 * B2 as a grid: players down, the month's training days across, one tap per
 * cell to cycle the school's five marks. Each tap saves on its own; totals
 * for the whole school year and the per-term rates update as you go.
 */
export default function AttendanceGrid({
  teamId,
  lang,
  roster,
  month,
  today,
  days: initialDays,
  marks: initialMarks,
  terms,
}: {
  teamId: string;
  lang: Lang;
  roster: GridPlayer[];
  /** "2026-10" */
  month: string;
  today: string;
  /** Days of this month that already have marks. */
  days: string[];
  /** The whole school year's marks, by player then day. */
  marks: Marks;
  /** [from, to] of the sheet's two semesters, for its "% por semestre". */
  terms: [[string, string], [string, string]];
}) {
  const g = bt(lang).grid;
  const labels = ATTENDANCE_LABEL[lang];
  const [marks, setMarks] = useState<Marks>(initialMarks);
  const [extraDays, setExtraDays] = useState<string[]>([]);
  const [newDay, setNewDay] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const days = useMemo(() => [...new Set([...initialDays, ...extraDays])].sort(), [initialDays, extraDays]);
  const fmt = useMemo(
    () => new Intl.DateTimeFormat(lang === "es" ? "es-MX" : lang === "ko" ? "ko-KR" : "en-US", { weekday: "short", day: "numeric", timeZone: "UTC" }),
    [lang],
  );
  const dayLabel = (d: string) => fmt.format(new Date(`${d}T00:00:00Z`));
  const last = `${month}-31` < today ? `${month}-31` : today;

  async function save(day: string, entries: { userId: string; status: AttendanceStatusKey | null }[]) {
    const before = marks;
    setMarks((m) => {
      const out = { ...m };
      for (const { userId, status } of entries) {
        const row = { ...(out[userId] ?? {}) };
        if (status) row[day] = status;
        else delete row[day];
        out[userId] = row;
      }
      return out;
    });
    setError(null);
    const res = await fetch(`/api/teams/${teamId}/attendance`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, marks: entries }),
    }).catch(() => null);
    if (!res?.ok) {
      setMarks(before);
      setError(g.errSave);
    }
  }

  function addDay(e: React.FormEvent) {
    e.preventDefault();
    if (!newDay.startsWith(month) || newDay > today) return;
    setExtraDays((d) => [...d, newDay]);
    setNewDay("");
    setAdding(false);
  }

  const totals = (userId: string) => {
    const row = Object.values(marks[userId] ?? {});
    return {
      came: row.filter((s) => ATTENDED.has(s)).length,
      absent: row.filter((s) => s === "FALTA").length,
      excused: row.filter((s) => s === "JUSTIFICADA").length,
    };
  };

  return (
    <div>
      <div className="no-print flex flex-wrap items-center gap-2">
        {ATTENDANCE_STATUSES.map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1 text-[11px] font-bold ${ATTENDANCE_STYLE[k]}`}>
              {labels[k].code}
            </span>
            {labels[k].label}
          </span>
        ))}
        <span className="flex-1" />
        {adding ? (
          <form onSubmit={addDay} className="flex items-center gap-2">
            <label className="text-xs text-slate-600">
              <span className="sr-only">{g.addDayLabel}</span>
              <input
                type="date"
                className="input py-1 text-sm"
                aria-label={g.addDayLabel}
                min={`${month}-01`}
                max={last}
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn-primary px-3 py-1 text-xs">
              {g.addDayGo}
            </button>
          </form>
        ) : (
          `${month}-01` <= today && (
            <button type="button" className="btn-ghost px-3 py-1 text-xs" onClick={() => setAdding(true)}>
              {g.addDay}
            </button>
          )
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="card mt-3 overflow-x-auto">
        <table className="w-full text-sm" data-testid="attendance-grid">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] text-slate-500">
              <th className="sticky left-0 z-10 w-8 bg-white px-2 py-2 text-left font-semibold">#</th>
              <th className="sticky left-8 z-10 min-w-40 bg-white px-2 py-2 text-left font-semibold">{tl(lang).common.player}</th>
              {days.map((d) => (
                <th key={d} className="px-1 py-1 text-center font-semibold">
                  <span className="block whitespace-nowrap capitalize">{dayLabel(d)}</span>
                  <button
                    type="button"
                    className="no-print mt-0.5 rounded px-1 text-[10px] font-semibold text-brand hover:bg-slate-100 disabled:cursor-default disabled:text-slate-500 disabled:hover:bg-transparent"
                    aria-label={g.allPresentLabel(dayLabel(d))}
                    onClick={() =>
                      save(
                        d,
                        roster.filter((p) => !marks[p.userId]?.[d]).map((p) => ({ userId: p.userId, status: "ASISTENCIA" as const })),
                      )
                    }
                    disabled={roster.every((p) => marks[p.userId]?.[d])}
                  >
                    {g.allPresent}
                  </button>
                </th>
              ))}
              <th className="border-l border-slate-100 px-2 py-2 text-center font-semibold text-emerald-800">{g.asist}</th>
              <th className="px-2 py-2 text-center font-semibold">{g.faltas}</th>
              <th className="px-2 py-2 text-center font-semibold text-sky-800">{g.justif}</th>
              <th className="border-l border-slate-100 px-2 py-2 text-center font-semibold">{g.sem1}</th>
              <th className="px-2 py-2 text-center font-semibold">{g.sem2}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roster.map((p) => {
              const t = totals(p.userId);
              const [s1, s2] = terms.map((range) => semesterPercent(marks[p.userId], range));
              return (
                <tr key={p.userId} data-player={p.name}>
                  <td className="sticky left-0 bg-white px-2 py-1.5 tabular-nums text-slate-500">{p.number ?? ""}</td>
                  <td className="sticky left-8 bg-white px-2 py-1.5 font-medium">{p.name}</td>
                  {days.map((d) => {
                    const s = marks[p.userId]?.[d];
                    return (
                      <td key={d} className="px-1 py-1 text-center">
                        <button
                          type="button"
                          aria-label={g.cell(p.name, dayLabel(d), s ? labels[s].label : g.unmarked)}
                          onClick={() => save(d, [{ userId: p.userId, status: next(s) }])}
                          className={`h-8 w-8 rounded-md text-xs font-bold transition ${
                            s ? ATTENDANCE_STYLE[s] : "border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {s ? labels[s].code : "+"}
                        </button>
                      </td>
                    );
                  })}
                  <td className="border-l border-slate-100 px-2 text-center font-semibold tabular-nums text-emerald-800">{t.came}</td>
                  <td className="px-2 text-center tabular-nums">{t.absent}</td>
                  <td className="px-2 text-center tabular-nums text-sky-800">{t.excused}</td>
                  <td className="border-l border-slate-100 px-2 text-center tabular-nums">{s1}%</td>
                  <td className="px-2 text-center tabular-nums">{s2}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {days.length === 0 && <p className="p-6 text-center text-sm text-slate-600">{g.noDays}</p>}
      </div>
      <p className="mt-2 text-xs text-slate-600">{g.trainings(days.filter((d) => roster.some((p) => marks[p.userId]?.[d])).length)}</p>
      <p className="mt-1 text-xs text-slate-600">{g.semNote}</p>
    </div>
  );
}
