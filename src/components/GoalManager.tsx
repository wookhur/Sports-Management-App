"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDuration } from "@/lib/format";
import { metricLabel, type Lang } from "@/lib/i18n";

export interface GoalView {
  id: string;
  metricKey: string;
  metricName: string;
  targetMs: number;
  achieved: boolean;
  /** Current best for the metric, or null if no timed record yet. */
  bestMs: number | null;
}

const L: Record<
  Lang,
  {
    heading: string;
    sub: string;
    empty: string;
    targetBefore: string;
    targetAfter: string;
    achievedBadge: string;
    deleteAria: (metricName: string) => string;
    deleteConfirm: string;
    noRecordYet: string;
    achievedText: (best: string) => string;
    progressText: (best: string, remaining: string) => string;
    newGoalLabel: string;
    minutesAria: string;
    minutes: string;
    secondsAria: string;
    seconds: string;
    errEnterTime: string;
    errSaveFailed: string;
    saving: string;
    addGoal: string;
  }
> = {
  ko: {
    heading: "🎯 목표",
    sub: "목표 기록을 정하고 달성해보세요.",
    empty: "아직 목표가 없어요. 아래에서 첫 목표를 세워보세요!",
    targetBefore: " ",
    targetAfter: " 안에",
    achievedBadge: "🎉 달성!",
    deleteAria: (metricName) => `${metricName} 목표 삭제`,
    deleteConfirm: "이 목표를 삭제할까요?",
    noRecordYet: "아직 기록이 없어요 — 측정하면 진행률이 표시돼요",
    achievedText: (best) => `최고 기록 ${best} — 목표를 넘어섰어요!`,
    progressText: (best, remaining) => `현재 최고 ${best} · ${remaining} 남음`,
    newGoalLabel: "새 목표",
    minutesAria: "분",
    minutes: "분",
    secondsAria: "초",
    seconds: "초",
    errEnterTime: "목표 시간을 입력하세요",
    errSaveFailed: "목표를 저장하지 못했습니다",
    saving: "저장 중…",
    addGoal: "목표 추가",
  },
  en: {
    heading: "🎯 Goals",
    sub: "Set a target time and go get it.",
    empty: "No goals yet. Set your first one below!",
    targetBefore: " under ",
    targetAfter: "",
    achievedBadge: "🎉 Achieved!",
    deleteAria: (metricName) => `Delete ${metricName} goal`,
    deleteConfirm: "Delete this goal?",
    noRecordYet: "No records yet — progress will show once you log a time",
    achievedText: (best) => `Best time ${best} — you beat your goal!`,
    progressText: (best, remaining) => `Current best ${best} · ${remaining} to go`,
    newGoalLabel: "New goal",
    minutesAria: "Minutes",
    minutes: "min",
    secondsAria: "Seconds",
    seconds: "sec",
    errEnterTime: "Enter a target time",
    errSaveFailed: "Couldn't save the goal",
    saving: "Saving…",
    addGoal: "Add goal",
  },
  es: {
    heading: "🎯 Metas",
    sub: "Fija un tiempo objetivo y ve por él.",
    empty: "Aún no tienes metas. ¡Crea la primera aquí abajo!",
    targetBefore: " en menos de ",
    targetAfter: "",
    achievedBadge: "🎉 ¡Conseguido!",
    deleteAria: (metricName) => `Eliminar meta de ${metricName}`,
    deleteConfirm: "¿Eliminar esta meta?",
    noRecordYet: "Aún no hay registros — el progreso aparecerá cuando registres un tiempo",
    achievedText: (best) => `Mejor marca ${best} — ¡superaste tu meta!`,
    progressText: (best, remaining) => `Mejor marca actual ${best} · faltan ${remaining}`,
    newGoalLabel: "Nueva meta",
    minutesAria: "Minutos",
    minutes: "min",
    secondsAria: "Segundos",
    seconds: "seg",
    errEnterTime: "Ingresa un tiempo objetivo",
    errSaveFailed: "No se pudo guardar la meta",
    saving: "Guardando…",
    addGoal: "Agregar meta",
  },
};

export default function GoalManager({
  goals,
  metrics,
  lang = "en",
}: {
  goals: GoalView[];
  metrics: { key: string; name: string }[];
  lang?: Lang;
}) {
  const s = L[lang];
  const router = useRouter();
  const [metricKey, setMetricKey] = useState(metrics[0]?.key ?? "");
  const [minutes, setMinutes] = useState("0");
  const [seconds, setSeconds] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const m = parseInt(minutes || "0", 10);
    const sec = parseFloat(seconds || "0");
    if (Number.isNaN(m) || Number.isNaN(sec) || m * 60 + sec <= 0) {
      setError(s.errEnterTime);
      return;
    }
    setBusy(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sport: "swimming", metricKey, targetMs: Math.round((m * 60 + sec) * 1000) }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? s.errSaveFailed);
      return;
    }
    setMinutes("0");
    setSeconds("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm(s.deleteConfirm)) return;
    const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="card p-5">
      <h2 className="font-bold">{s.heading}</h2>
      <p className="mt-0.5 text-xs text-slate-500">{s.sub}</p>

      <div className="mt-4 space-y-3">
        {goals.length === 0 && (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {s.empty}
          </p>
        )}
        {goals.map((g) => {
          const pct =
            g.bestMs == null ? 0 : Math.max(0, Math.min(100, Math.round((g.targetMs / g.bestMs) * 100)));
          const name = metricLabel(g.metricKey, g.metricName, lang);
          return (
            <div key={g.id} className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {name}
                  {s.targetBefore}
                  <span className="font-mono text-slate-500">{formatDuration(g.targetMs)}</span>
                  {s.targetAfter}
                </p>
                <div className="flex items-center gap-2">
                  {g.achieved && <span className="badge bg-emerald-50 text-emerald-700">{s.achievedBadge}</span>}
                  <button
                    type="button"
                    onClick={() => remove(g.id)}
                    aria-label={s.deleteAria(name)}
                    className="text-xs text-slate-300 transition-colors hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={g.achieved ? 100 : pct} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={`h-full rounded-full transition-all ${g.achieved ? "bg-emerald-500" : "bg-brand"}`}
                  style={{ width: `${g.achieved ? 100 : pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {g.bestMs == null
                  ? s.noRecordYet
                  : g.achieved
                    ? s.achievedText(formatDuration(g.bestMs))
                    : s.progressText(formatDuration(g.bestMs), formatDuration(g.bestMs - g.targetMs))}
              </p>
            </div>
          );
        })}
      </div>

      <form onSubmit={create} className="mt-4 space-y-2 border-t border-slate-100 pt-4">
        <label className="label" htmlFor="goal-metric">{s.newGoalLabel}</label>
        <select
          id="goal-metric"
          className="input"
          value={metricKey}
          onChange={(e) => setMetricKey(e.target.value)}
        >
          {metrics.map((m) => (
            <option key={m.key} value={m.key}>
              {metricLabel(m.key, m.name, lang)}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            className="input"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            aria-label={s.minutesAria}
          />
          <span className="text-sm text-slate-500">{s.minutes}</span>
          <input
            className="input"
            inputMode="decimal"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            placeholder="32.5"
            aria-label={s.secondsAria}
          />
          <span className="text-sm text-slate-500">{s.seconds}</span>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full text-sm">
          {busy ? s.saving : s.addGoal}
        </button>
      </form>
    </div>
  );
}
