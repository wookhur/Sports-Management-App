"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Metric } from "@/lib/sports";
import { formatDuration, formatPace } from "@/lib/format";

type Mode = "timer" | "manual";

export default function Stopwatch({
  sportId,
  metrics,
}: {
  sportId: string;
  metrics: Metric[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("timer");
  const [metricKey, setMetricKey] = useState(metrics[0]?.key ?? "");
  const [customDistance, setCustomDistance] = useState(100);

  // Timer state
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Manual entry state (분 / 초 / 1000분의1초)
  const [manualMin, setManualMin] = useState("");
  const [manualSec, setManualSec] = useState("");
  const [manualMs, setManualMs] = useState("");

  const [notes, setNotes] = useState("");
  const [shared, setShared] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const metric = metrics.find((m) => m.key === metricKey);
  const isCustom = metric?.capture.includes("distance") && !metric.distanceM;
  const distanceM = metric?.distanceM ?? (isCustom ? customDistance : undefined);

  // The duration currently ready to save, depending on active mode.
  const manualDurationMs =
    (Number(manualMin) || 0) * 60000 + (Number(manualSec) || 0) * 1000 + (Number(manualMs) || 0);
  const activeDurationMs = mode === "timer" ? elapsed : manualDurationMs;
  const pace = distanceM ? formatPace(distanceM, activeDurationMs) : null;

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

  function switchMode(next: Mode) {
    if (next === mode) return;
    stop();
    setError(null);
    setMode(next);
  }

  async function save() {
    if (mode === "manual" && (Number(manualSec) >= 60 || Number(manualMs) >= 1000)) {
      setError("초는 0~59, 1000분의1초는 0~999 범위로 입력하세요");
      return;
    }
    if (activeDurationMs <= 0) {
      setError(mode === "timer" ? "먼저 기록을 측정하세요" : "기록 시간을 입력하세요");
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
        durationMs: Math.round(activeDurationMs),
        ...(isCustom ? { distanceM: customDistance } : {}),
        notes,
        shared,
      }),
    });
    const data = await res.json().catch(() => null);
    setSaving(false);
    if (!res.ok) {
      setError(data?.error ?? "저장에 실패했습니다");
      return;
    }
    setElapsed(0);
    setManualMin("");
    setManualSec("");
    setManualMs("");
    setNotes("");
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
    router.refresh();
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">⏱️ 기록 측정</h3>
        <div className="flex rounded-lg bg-slate-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => switchMode("timer")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              mode === "timer" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
            }`}
          >
            타이머
          </button>
          <button
            type="button"
            onClick={() => switchMode("manual")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              mode === "manual" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
            }`}
          >
            직접 입력
          </button>
        </div>
      </div>

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

      {mode === "timer" ? (
        <>
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
        </>
      ) : (
        <>
          {/* Manual entry */}
          <div className="mt-5 rounded-2xl bg-slate-900 p-6">
            <p className="mb-3 text-center text-xs text-slate-400">기록 시간 직접 입력</p>
            <div className="flex items-end justify-center gap-2">
              <ManualField label="분" value={manualMin} onChange={setManualMin} max={999} />
              <span className="pb-2.5 text-2xl font-bold text-slate-500">:</span>
              <ManualField label="초" value={manualSec} onChange={setManualSec} max={59} />
              <span className="pb-2.5 text-2xl font-bold text-slate-500">.</span>
              <ManualField label="1/1000초" value={manualMs} onChange={setManualMs} max={999} wide />
            </div>
            <div className="mt-3 text-center text-sm text-slate-400">
              {formatDuration(manualDurationMs)}
              {distanceM ? ` · ${distanceM}m` : ""}
              {pace && manualDurationMs > 0 ? ` · ${pace}` : ""}
            </div>
          </div>

          <div className="mt-4">
            <button onClick={save} disabled={saving || activeDurationMs <= 0} className="btn-primary w-full">
              {saving ? "저장 중…" : "💾 저장"}
            </button>
          </div>
        </>
      )}

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

function ManualField({
  label,
  value,
  onChange,
  max,
  wide,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  wide?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <input
        type="number"
        min={0}
        max={max}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={`rounded-lg border border-slate-700 bg-slate-800 py-2 text-center font-mono text-2xl font-bold tabular-nums text-white outline-none focus:border-brand ${
          wide ? "w-20" : "w-16"
        }`}
      />
      <span className="text-[10px] text-slate-500">{label}</span>
    </div>
  );
}
