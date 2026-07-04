"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Metric } from "@/lib/sports";
import { formatDuration, formatPace } from "@/lib/format";

export default function Stopwatch({
  sportId,
  metrics,
}: {
  sportId: string;
  metrics: Metric[];
}) {
  const router = useRouter();
  const [metricKey, setMetricKey] = useState(metrics[0]?.key ?? "");
  const [customDistance, setCustomDistance] = useState(100);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState("");
  const [shared, setShared] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const metric = metrics.find((m) => m.key === metricKey);
  const isCustom = metric?.capture.includes("distance") && !metric.distanceM;
  const distanceM = metric?.distanceM ?? (isCustom ? customDistance : undefined);
  const pace = distanceM ? formatPace(distanceM, elapsed) : null;

  function tick() {
    setElapsed(Date.now() - startRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }

  function start() {
    startRef.current = Date.now() - elapsed;
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }

  function stop() {
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  function reset() {
    stop();
    setElapsed(0);
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  async function save() {
    if (elapsed <= 0) {
      setError("먼저 기록을 측정하세요");
      return;
    }
    stop();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sport: sportId,
        metricKey,
        durationMs: Math.round(elapsed),
        ...(isCustom ? { distanceM: customDistance } : {}),
        notes,
        shared,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "저장에 실패했습니다");
      return;
    }
    setElapsed(0);
    setNotes("");
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
    router.refresh();
  }

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="text-lg font-bold">⏱️ 기록 측정</h3>

      {/* Metric selector */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">측정 항목</label>
          <select
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
        </div>
        {isCustom && (
          <div>
            <label className="label">거리 (m)</label>
            <input
              className="input"
              type="number"
              min={1}
              value={customDistance}
              onChange={(e) => setCustomDistance(Number(e.target.value))}
            />
          </div>
        )}
      </div>

      {/* Timer display */}
      <div className="mt-5 rounded-2xl bg-slate-900 py-8 text-center">
        <div className="font-mono text-5xl font-bold tabular-nums text-white sm:text-6xl">
          {formatDuration(elapsed)}
        </div>
        <div className="mt-2 text-sm text-slate-400">
          {distanceM ? `${distanceM}m` : "거리 선택"}
          {pace && elapsed > 0 ? ` · ${pace}` : ""}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {!running ? (
          <button onClick={start} className="btn bg-emerald-500 text-white hover:bg-emerald-600">
            ▶ {elapsed > 0 ? "계속" : "시작"}
          </button>
        ) : (
          <button onClick={stop} className="btn bg-amber-500 text-white hover:bg-amber-600">
            ⏸ 정지
          </button>
        )}
        <button onClick={reset} className="btn-ghost" disabled={elapsed === 0 && !running}>
          ↺ 초기화
        </button>
        <button onClick={save} disabled={saving || elapsed === 0} className="btn-primary">
          {saving ? "저장 중…" : "💾 저장"}
        </button>
      </div>

      {/* Notes + share */}
      <div className="mt-4">
        <label className="label">메모 (선택)</label>
        <input
          className="input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="예: 출발 반응 좋았음, 턴 개선 필요"
        />
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={shared}
          onChange={(e) => setShared(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
        />
        코치에게 바로 공유하기
      </label>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {savedFlash && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
          ✓ 기록이 저장되었습니다
        </p>
      )}
    </div>
  );
}
