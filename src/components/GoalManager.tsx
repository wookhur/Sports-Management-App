"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDuration } from "@/lib/format";

export interface GoalView {
  id: string;
  metricName: string;
  targetMs: number;
  achieved: boolean;
  /** Current best for the metric, or null if no timed record yet. */
  bestMs: number | null;
}

export default function GoalManager({
  goals,
  metrics,
}: {
  goals: GoalView[];
  metrics: { key: string; name: string }[];
}) {
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
    const s = parseFloat(seconds || "0");
    if (Number.isNaN(m) || Number.isNaN(s) || m * 60 + s <= 0) {
      setError("목표 시간을 입력하세요");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sport: "swimming", metricKey, targetMs: Math.round((m * 60 + s) * 1000) }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? "목표를 저장하지 못했습니다");
      return;
    }
    setMinutes("0");
    setSeconds("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("이 목표를 삭제할까요?")) return;
    const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="card p-5">
      <h2 className="font-bold">🎯 목표</h2>
      <p className="mt-0.5 text-xs text-slate-400">목표 기록을 정하고 달성해보세요.</p>

      <div className="mt-4 space-y-3">
        {goals.length === 0 && (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            아직 목표가 없어요. 아래에서 첫 목표를 세워보세요!
          </p>
        )}
        {goals.map((g) => {
          const pct =
            g.bestMs == null ? 0 : Math.max(0, Math.min(100, Math.round((g.targetMs / g.bestMs) * 100)));
          return (
            <div key={g.id} className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {g.metricName}{" "}
                  <span className="font-mono text-slate-500">{formatDuration(g.targetMs)}</span> 안에
                </p>
                <div className="flex items-center gap-2">
                  {g.achieved && <span className="badge bg-emerald-50 text-emerald-600">🎉 달성!</span>}
                  <button
                    type="button"
                    onClick={() => remove(g.id)}
                    aria-label={`${g.metricName} 목표 삭제`}
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
              <p className="mt-1.5 text-xs text-slate-400">
                {g.bestMs == null
                  ? "아직 기록이 없어요 — 측정하면 진행률이 표시돼요"
                  : g.achieved
                    ? `최고 기록 ${formatDuration(g.bestMs)} — 목표를 넘어섰어요!`
                    : `현재 최고 ${formatDuration(g.bestMs)} · ${formatDuration(g.bestMs - g.targetMs)} 남음`}
              </p>
            </div>
          );
        })}
      </div>

      <form onSubmit={create} className="mt-4 space-y-2 border-t border-slate-100 pt-4">
        <label className="label" htmlFor="goal-metric">새 목표</label>
        <select
          id="goal-metric"
          className="input"
          value={metricKey}
          onChange={(e) => setMetricKey(e.target.value)}
        >
          {metrics.map((m) => (
            <option key={m.key} value={m.key}>
              {m.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            className="input"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            aria-label="분"
          />
          <span className="text-sm text-slate-400">분</span>
          <input
            className="input"
            inputMode="decimal"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            placeholder="32.5"
            aria-label="초"
          />
          <span className="text-sm text-slate-400">초</span>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full text-sm">
          {busy ? "저장 중…" : "목표 추가"}
        </button>
      </form>
    </div>
  );
}
