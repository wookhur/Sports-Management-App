"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface TeamRow {
  id: string;
  name: string;
  code: string;
  memberCount: number;
}

// Coach side: create teams and share the invite code.
export default function TeamPanel({ teams }: { teams: TeamRow[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? "팀을 만들지 못했습니다");
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <div className="card p-5">
      <h2 className="font-bold">👥 팀</h2>
      <p className="mt-0.5 text-xs text-slate-400">팀을 만들고 초대 코드를 선수에게 알려주세요.</p>

      {teams.length > 0 && (
        <ul className="mt-4 space-y-2">
          {teams.map((team) => (
            <li key={team.id}>
              <Link
                href={`/teams/${team.id}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{team.name}</p>
                  <p className="text-xs text-slate-400">{team.memberCount}명</p>
                </div>
                <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs font-bold tracking-widest text-slate-600">
                  {team.code}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={create} className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="새 팀 이름"
          maxLength={40}
          required
        />
        <button type="submit" disabled={busy} className="btn-primary shrink-0 text-sm">
          {busy ? "생성 중…" : "만들기"}
        </button>
      </form>
      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
