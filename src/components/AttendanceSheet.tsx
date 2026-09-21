"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";

export interface AttendanceMember {
  userId: string;
  name: string;
  /** Today's mark, or null when the register hasn't been taken for them. */
  present: boolean | null;
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
    present: string;
    absent: string;
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
    present: "출석",
    absent: "결석",
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
    present: "Present",
    absent: "Absent",
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
    present: "Presente",
    absent: "Ausente",
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
 * Three states per row, deliberately: present, absent, and not marked. A coach
 * who opens the sheet and saves nothing has not marked anyone absent, and the
 * rate on the right only counts days that were actually taken.
 */
export default function AttendanceSheet({
  teamId,
  day,
  windowDays,
  members,
  lang = "en",
}: {
  teamId: string;
  day: string;
  windowDays: number;
  members: AttendanceMember[];
  lang?: Lang;
}) {
  const s = L[lang];
  const router = useRouter();
  const [marks, setMarks] = useState<Record<string, boolean | null>>(
    Object.fromEntries(members.map((m) => [m.userId, m.present])),
  );
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set(userId: string, present: boolean) {
    setMarks((m) => ({ ...m, [userId]: present }));
    setStatus(null);
  }

  async function save() {
    const toSend = Object.entries(marks)
      .filter((e): e is [string, boolean] => e[1] !== null)
      .map(([userId, present]) => ({ userId, present }));
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

  const dirty = members.some((m) => marks[m.userId] !== m.present);

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">{s.heading}</h2>
          <p className="text-sm text-slate-600">{s.sub(windowDays)}</p>
        </div>
        <button
          type="button"
          onClick={() => setMarks(Object.fromEntries(members.map((m) => [m.userId, true])))}
          className="btn-ghost text-xs"
        >
          {s.allPresent}
        </button>
      </div>
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 text-xs">
          <span className="font-semibold uppercase tracking-wide text-slate-500">
            {s.dayLabel} · <span className="tabular-nums text-slate-700">{day}</span>
          </span>
          <span className="text-slate-500" role="status">
            {status ?? ""}
          </span>
        </div>
        <ul className="divide-y divide-slate-100">
          {members.map((m) => {
            const mark = marks[m.userId];
            return (
              <li key={m.userId} className="flex flex-wrap items-center gap-3 px-5 py-2.5">
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{m.name}</p>
                <div
                  role="radiogroup"
                  aria-label={m.name}
                  className="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-semibold"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={mark === true}
                    onClick={() => set(m.userId, true)}
                    className={`px-3 py-1.5 transition-colors ${
                      mark === true ? "bg-emerald-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {s.present}
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={mark === false}
                    onClick={() => set(m.userId, false)}
                    className={`border-l border-slate-200 px-3 py-1.5 transition-colors ${
                      mark === false ? "bg-slate-700 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {s.absent}
                  </button>
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
