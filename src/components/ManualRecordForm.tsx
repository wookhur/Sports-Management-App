"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Metric } from "@/lib/sports";
import { formatDuration, formatPace } from "@/lib/format";

// Today's date as "YYYY-MM-DD" in the user's local timezone (for the date input).
function todayLocal(): string {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}

export default function ManualRecordForm({
  sportId,
  metrics,
}: {
  sportId: string;
  metrics: Metric[];
}) {
  const router = useRouter();
  const [metricKey, setMetricKey] = useState(metrics[0]?.key ?? "");
  const [customDistance, setCustomDistance] = useState(100);
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [centis, setCentis] = useState("");
  const [date, setDate] = useState(todayLocal());
  const [notes, setNotes] = useState("");
  const [shared, setShared] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const metric = metrics.find((m) => m.key === metricKey);
  const isCustom = metric?.capture.includes("distance") && !metric.distanceM;
  const distanceM = metric?.distanceM ?? (isCustom ? customDistance : undefined);

  const durationMs =
    (Number(minutes) || 0) * 60_000 +
    (Number(seconds) || 0) * 1_000 +
    (Number(centis) || 0) * 10;

  const pace = distanceM && durationMs > 0 ? formatPace(distanceM, durationMs) : null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (durationMs <= 0) {
      setError("기록 시간을 입력하세요");
      return;
    }
    if ((Number(seconds) || 0) >= 60) {
      setError("초는 0~59 사이여야 합니다");
      return;
    }

    setSaving(true);
    try {
      // Send the chosen day at local noon so the record lands on that calendar
      // date regardless of timezone.
      const occurredAt = new Date(`${date}T12:00:00`).toISOString();
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport: sportId,
          metricKey,
          durationMs,
          ...(isCustom ? { distanceM: customDistance } : {}),
          occurredAt,
          notes,
          shared,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "저장에 실패했습니다");
        return;
      }
      setMinutes("");
      setSeconds("");
      setCentis("");
      setNotes("");
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
      router.refresh();
    } catch {
      setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card p-5 sm:p-6">
      <h3 className="text-lg font-bold">✍️ 기록 직접 입력</h3>
      <p className="mt-1 text-sm text-slate-500">
        이미 알고 있는 기록을 직접 입력합니다. 측정 날짜도 선택할 수 있어요.
      </p>

      {/* Metric + distance */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">측정 항목</label>
          <select className="input" value={metricKey} onChange={(e) => setMetricKey(e.target.value)}>
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

      {/* Time entry */}
      <div className="mt-4">
        <label className="label">기록 시간</label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <input
              className="input text-center tabular-nums"
              type="number"
              min={0}
              inputMode="numeric"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="분"
            />
            <p className="mt-1 text-center text-xs text-slate-400">분</p>
          </div>
          <div>
            <input
              className="input text-center tabular-nums"
              type="number"
              min={0}
              max={59}
              inputMode="numeric"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              placeholder="초"
            />
            <p className="mt-1 text-center text-xs text-slate-400">초</p>
          </div>
          <div>
            <input
              className="input text-center tabular-nums"
              type="number"
              min={0}
              max={99}
              inputMode="numeric"
              value={centis}
              onChange={(e) => setCentis(e.target.value)}
              placeholder="1/100"
            />
            <p className="mt-1 text-center text-xs text-slate-400">1/100초</p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-slate-900 py-4 text-center">
          <div className="font-mono text-3xl font-bold tabular-nums text-white">
            {formatDuration(durationMs)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {distanceM ? `${distanceM}m` : "거리 선택"}
            {pace ? ` · ${pace}` : ""}
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="mt-4">
        <label className="label">측정 날짜</label>
        <input
          className="input"
          type="date"
          value={date}
          max={todayLocal()}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Notes + share */}
      <div className="mt-4">
        <label className="label">메모 (선택)</label>
        <input
          className="input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="예: 대회 기록, 컨디션 좋았음"
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

      <button type="submit" disabled={saving} className="btn-primary mt-4 w-full">
        {saving ? "저장 중…" : "💾 기록 저장"}
      </button>
    </form>
  );
}
