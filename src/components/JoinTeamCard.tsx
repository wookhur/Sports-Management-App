"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Lang } from "@/lib/i18n";

export interface MyTeam {
  id: string;
  name: string;
  coachName: string;
  memberCount: number;
}

const L: Record<
  Lang,
  {
    title: string;
    empty: string;
    teamMeta: (coach: string, n: number) => string;
    codePlaceholder: string;
    join: string;
    joining: string;
    errFallback: string;
  }
> = {
  ko: {
    title: "👥 내 팀",
    empty: "코치에게 받은 초대 코드로 팀에 참여하세요.",
    teamMeta: (coach, n) => `${coach} 코치 · ${n}명`,
    codePlaceholder: "초대 코드",
    join: "참여",
    joining: "확인 중…",
    errFallback: "팀에 참여하지 못했습니다",
  },
  en: {
    title: "👥 My teams",
    empty: "Join a team with the invite code from your coach.",
    teamMeta: (coach, n) => `Coach ${coach} · ${n} member${n === 1 ? "" : "s"}`,
    codePlaceholder: "Invite code",
    join: "Join",
    joining: "Checking…",
    errFallback: "Couldn't join the team",
  },
  es: {
    title: "👥 Mis equipos",
    empty: "Únete a un equipo con el código de invitación de tu entrenador.",
    teamMeta: (coach, n) => `Entrenador ${coach} · ${n} miembro${n === 1 ? "" : "s"}`,
    codePlaceholder: "Código de invitación",
    join: "Unirme",
    joining: "Verificando…",
    errFallback: "No se pudo unir al equipo",
  },
};

// Athlete side: join a team with the coach's invite code + list my teams.
export default function JoinTeamCard({
  teams,
  lang = "ko",
}: {
  teams: MyTeam[];
  lang?: Lang;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const s = L[lang];

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
      setError(data?.error ?? s.errFallback);
      return;
    }
    setCode("");
    router.refresh();
  }

  return (
    <div className="card p-5">
      <h2 className="font-bold">{s.title}</h2>

      {teams.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{s.empty}</p>
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
                  <p className="text-xs text-slate-500">
                    {s.teamMeta(team.coachName, team.memberCount)}
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
          placeholder={s.codePlaceholder}
          maxLength={12}
          required
        />
        <button type="submit" disabled={busy} className="btn-primary shrink-0 text-sm">
          {busy ? s.joining : s.join}
        </button>
      </form>
      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
