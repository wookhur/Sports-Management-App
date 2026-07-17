"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface MyTeam {
  id: string;
  name: string;
  coachName: string;
  memberCount: number;
}

// Athlete side: join a team with the coach's invite code + list my teams.
export default function JoinTeamCard({ teams }: { teams: MyTeam[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? "팀에 참여하지 못했습니다");
      return;
    }
    setCode("");
    router.refresh();
  }

  return (
    <div className="card p-5">
      <h2 className="font-bold">👥 내 팀</h2>

      {teams.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">코치에게 받은 초대 코드로 팀에 참여하세요.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {teams.map((team) => (
            <li key={team.id}>
              <Link
                href={`/teams/${team.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{team.name}</p>
                  <p className="text-xs text-slate-400">
                    {team.coachName} 코치 · {team.memberCount}명
                  </p>
                </div>
                <span className="text-slate-300">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={join} className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        <input
          className="input font-mono uppercase tracking-widest"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="초대 코드"
          maxLength={12}
          required
        />
        <button type="submit" disabled={busy} className="btn-primary shrink-0 text-sm">
          {busy ? "확인 중…" : "참여"}
        </button>
      </form>
      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
