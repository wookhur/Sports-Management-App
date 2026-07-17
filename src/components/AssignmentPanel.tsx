"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface AssignmentRow {
  id: string;
  athleteName: string;
  title: string;
  linkHref: string | null;
  dueDate: string | null;
  completedAt: string | null;
}

// Coach side: assign training homework to a linked athlete and track status.
export default function AssignmentPanel({
  athletes,
  assignments,
}: {
  athletes: { id: string; name: string }[];
  assignments: AssignmentRow[];
}) {
  const router = useRouter();
  const [athleteId, setAthleteId] = useState(athletes[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [linkHref, setLinkHref] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ athleteId, title, note, linkHref }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? "과제를 저장하지 못했습니다");
      return;
    }
    setTitle("");
    setLinkHref("");
    setNote("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("이 과제를 삭제할까요?")) return;
    const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="card p-5">
      <h2 className="font-bold">📋 훈련 과제</h2>
      <p className="mt-0.5 text-xs text-slate-400">선수에게 이번 주 과제를 배정하세요.</p>

      {athletes.length === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          연결된 선수가 있어야 과제를 배정할 수 있어요.
        </p>
      ) : (
        <form onSubmit={create} className="mt-4 space-y-2">
          <select className="input" value={athleteId} onChange={(e) => setAthleteId(e.target.value)} aria-label="선수 선택">
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="과제 이름 (예: 자유형 인터벌 8×50m)"
            required
          />
          <input
            className="input text-xs"
            value={linkHref}
            onChange={(e) => setLinkHref(e.target.value)}
            placeholder="앱 내 링크 (선택, 예: /sports/swimming/workouts)"
          />
          <input
            className="input text-xs"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="메모 (선택)"
            maxLength={500}
          />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full text-sm">
            {busy ? "배정 중…" : "과제 배정"}
          </button>
        </form>
      )}

      {assignments.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5">
              <div className="min-w-0">
                <p className={`truncate text-sm font-medium ${a.completedAt ? "text-slate-400 line-through" : "text-slate-800"}`}>
                  {a.title}
                </p>
                <p className="text-xs text-slate-400">
                  {a.athleteName} · {a.completedAt ? "완료 ✅" : "진행 중"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(a.id)}
                aria-label={`${a.title} 과제 삭제`}
                className="shrink-0 text-xs text-slate-300 transition-colors hover:text-red-500"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
