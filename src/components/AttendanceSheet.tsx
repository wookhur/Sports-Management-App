"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { tl } from "@/lib/teamLogText";
import { ATTENDANCE_LABEL, ATTENDANCE_STATUSES, ATTENDANCE_STYLE, type AttendanceStatusKey } from "@/lib/bitacora";

export interface AttendanceMember {
  userId: string;
  name: string;
  /** The day's mark, or null when the register hasn't been taken for them. */
  mark: AttendanceStatusKey | null;
  /** Sessions marked in the recent window, and how many they attended. */
  recentMarked: number;
  recentPresent: number;
}

const L: Record<
  Lang,
  {
    heading: string;
    sub: (days: number) => string;
    dayLabel: string;
    unmarked: string;
    rate: (present: number, marked: number) => string;
    noHistory: string;
    save: string;
    saving: string;
    saved: (n: number) => string;
    allPresent: string;
    errSave: string;
  }
> = {
  ko: {
    heading: "출석",
    sub: (days) => `오늘 나온 선수를 표시하세요. 오른쪽은 최근 ${days}일 출석률이에요.`,
    dayLabel: "날짜",
    unmarked: "미체크",
    rate: (p, m) => `${m}회 중 ${p}회`,
    noHistory: "기록 없음",
    save: "저장",
    saving: "저장 중…",
    saved: (n) => `${n}명 저장했어요`,
    allPresent: "전원 출석",
    errSave: "출석을 저장하지 못했습니다",
  },
  en: {
    heading: "Attendance",
    sub: (days) => `Mark who turned up today. On the right, each athlete's rate over the last ${days} days.`,
    dayLabel: "Day",
    unmarked: "Not marked",
    rate: (p, m) => `${p} of ${m}`,
    noHistory: "No history",
    save: "Save",
    saving: "Saving…",
    saved: (n) => `Saved ${n}`,
    allPresent: "Everyone present",
    errSave: "Couldn't save attendance",
  },
  es: {
    heading: "Asistencia",
    sub: (days) => `Marca quién vino hoy. A la derecha, la asistencia de cada atleta en los últimos ${days} días.`,
    dayLabel: "Día",
    unmarked: "Sin marcar",
    rate: (p, m) => `${p} de ${m}`,
    noHistory: "Sin historial",
    save: "Guardar",
    saving: "Guardando…",
    saved: (n) => `Guardados ${n}`,
    allPresent: "Todos presentes",
    errSave: "No se pudo guardar la asistencia",
  },
};

/**
 * The register for one day, plus each athlete's recent rate.
 *
 * The school's five marks per row (asistencia, falta, tarde, incidente,
 * justificada), plus not marked. A coach who opens the sheet and saves
 * nothing has not marked anyone absent, and the rate on the right only counts
 * days that were actually taken. Late and incident count as attended; an
 * excused absence is still an absence for the rate.
 *
 * The day defaults to today where the team trains; the coach can pick an
 * earlier day to fill in a register they didn't take at the time.
 */
export default function AttendanceSheet({
  teamId,
  day,
  today,
  windowDays,
  members,
  lang = "en",
}: {
  teamId: string;
  day: string;
  today?: string;
  windowDays: number;
  members: AttendanceMember[];
  lang?: Lang;
}) {
  const s = L[lang];
  const t = tl(lang).attendance;
  const router = useRouter();
  const labels = ATTENDANCE_LABEL[lang];
  const [marks, setMarks] = useState<Record<string, AttendanceStatusKey | null>>(
    Object.fromEntries(members.map((m) => [m.userId, m.mark])),
  );
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set(userId: string, mark: AttendanceStatusKey) {
    setMarks((m) => ({ ...m, [userId]: mark }));
    setStatus(null);
  }

  async function save() {
    const toSend = Object.entries(marks)
      .filter((e): e is [string, AttendanceStatusKey] => e[1] !== null)
      .map(([userId, status]) => ({ userId, status }));
    if (toSend.length === 0) return;
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/teams/${teamId}/attendance`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, marks: toSend }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? s.errSave);
      return;
    }
    setStatus(s.saved(data?.saved ?? toSend.length));
    router.refresh();
  }

  const dirty = members.some((m) => marks[m.userId] !== m.mark);

  return (
    <section id="attendance" className="scroll-mt-24">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">{s.heading}</h2>
          <p className="text-sm text-slate-600">{s.sub(windowDays)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/teams/${teamId}/attendance`} className="text-xs font-semibold text-brand hover:underline">
            {t.history} →
          </Link>
          <button
            type="button"
            onClick={() => setMarks(Object.fromEntries(members.map((m) => [m.userId, "ASISTENCIA" as const])))}
            className="btn-ghost text-xs"
          >
            {s.allPresent}
          </button>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 text-xs">
          <label className="flex items-center gap-2 font-semibold uppercase tracking-wide text-slate-500">
            {s.dayLabel}
            <input
              type="date"
              value={day}
              max={today}
              onChange={(e) => {
                if (e.target.value) router.push(`/teams/${teamId}?day=${e.target.value}#attendance`, { scroll: false });
              }}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs font-normal normal-case tabular-nums text-slate-700"
            />
          </label>
          <span className="text-slate-500" role="status">
            {status ?? ""}
          </span>
        </div>
        <ul className="divide-y divide-slate-100">
          {members.map((m) => {
            const mark = marks[m.userId];
            return (
              <li key={m.userId} className="flex flex-wrap items-center gap-3 px-5 py-2.5">
                <p className="min-w-0 flex-1 basis-full truncate text-sm font-medium sm:basis-0">{m.name}</p>
                <div
                  role="radiogroup"
                  aria-label={m.name}
                  className="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-semibold"
                >
                  {ATTENDANCE_STATUSES.map((value, i) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={mark === value}
                      aria-label={labels[value].label}
                      title={labels[value].label}
                      onClick={() => set(m.userId, value)}
                      className={`min-w-9 px-2 py-1.5 transition-colors ${i > 0 ? "border-l border-slate-200" : ""} ${
                        mark === value ? ATTENDANCE_STYLE[value] : "bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="md:hidden">{labels[value].code}</span>
                      <span className="hidden md:inline">{labels[value].label}</span>
                    </button>
                  ))}
                </div>
                <span className="w-24 text-right text-xs tabular-nums text-slate-600">
                  {m.recentMarked === 0
                    ? s.noHistory
                    : `${Math.round((m.recentPresent / m.recentMarked) * 100)}% · ${s.rate(m.recentPresent, m.recentMarked)}`}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-3">
          {error && (
            <p role="alert" className="mr-auto text-xs text-red-700">
              {error}
            </p>
          )}
          <button type="button" onClick={save} disabled={busy || !dirty} className="btn-primary text-sm">
            {busy ? s.saving : s.save}
          </button>
        </div>
      </div>
    </section>
  );
}
