"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CloseIcon } from "./navIcons";
import type { Lang } from "@/lib/i18n";

export interface TeamMemberRow {
  userId: string;
  name: string;
  currentStreak: number;
}

const L: Record<
  Lang,
  {
    streakBadge: (n: number) => string;
    removeAria: (name: string) => string;
    confirmRemove: (name: string, team: string) => string;
    leave: string;
    confirmLeave: (team: string) => string;
    errRemove: string;
  }
> = {
  ko: {
    streakBadge: (n) => `${n}일 연속`,
    removeAria: (name) => `${name} 팀에서 빼기`,
    confirmRemove: (name, team) =>
      `${name} 선수를 '${team}' 팀에서 뺄까요? 기록과 계정은 그대로 남고, 초대 코드로 다시 들어올 수 있어요.`,
    leave: "팀 나가기",
    confirmLeave: (team) => `'${team}' 팀에서 나갈까요?`,
    errRemove: "팀에서 빼지 못했습니다",
  },
  en: {
    streakBadge: (n) => `${n}-day streak`,
    removeAria: (name) => `Remove ${name} from the team`,
    confirmRemove: (name, team) =>
      `Remove ${name} from “${team}”? Their records and account are kept, and they can rejoin with the invite code.`,
    leave: "Leave team",
    confirmLeave: (team) => `Leave “${team}”?`,
    errRemove: "Couldn't remove them from the team",
  },
  es: {
    streakBadge: (n) => `Racha de ${n} día${n === 1 ? "" : "s"}`,
    removeAria: (name) => `Sacar a ${name} del equipo`,
    confirmRemove: (name, team) =>
      `¿Sacar a ${name} de «${team}»? Se conservan su cuenta y sus marcas, y puede volver a unirse con el código.`,
    leave: "Salir del equipo",
    confirmLeave: (team) => `¿Salir de «${team}»?`,
    errRemove: "No se pudo sacar del equipo",
  },
};

/**
 * The team roster.
 *
 * The coach who owns the team can take anyone off it; a member can only take
 * themselves off. The server enforces both — this just decides which button to
 * draw.
 */
export default function TeamMemberList({
  teamId,
  teamName,
  members,
  canManage,
  selfUserId,
  lang = "en",
}: {
  teamId: string;
  teamName: string;
  members: TeamMemberRow[];
  canManage: boolean;
  selfUserId: string;
  lang?: Lang;
}) {
  const s = L[lang];
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(m: TeamMemberRow) {
    const leaving = m.userId === selfUserId;
    const question = leaving ? s.confirmLeave(teamName) : s.confirmRemove(m.name, teamName);
    if (!confirm(question)) return;
    setError(null);
    setBusy(m.userId);
    const res = await fetch(`/api/teams/${teamId}/members/${m.userId}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? s.errRemove);
      return;
    }
    if (leaving) window.location.assign("/");
    else router.refresh();
  }

  return (
    <>
      <div className="card divide-y divide-slate-100">
        {members.map((m, i) => {
          const isSelf = m.userId === selfUserId;
          const removable = canManage || isSelf;
          return (
            <div key={m.userId} className="flex items-center gap-3 px-4 py-3">
              {/* slate-500, not 400: the rank is the athlete's position in the streak
                  order, so it is content and has to clear AA. */}
              <span className="w-5 text-center text-sm font-bold text-slate-500">{i + 1}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                {m.name.slice(0, 1)}
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-medium">{m.name}</p>
              {m.currentStreak > 0 && (
                <span className="badge shrink-0 bg-orange-50 text-orange-700">
                  {s.streakBadge(m.currentStreak)}
                </span>
              )}
              {removable && (
                <button
                  type="button"
                  onClick={() => remove(m)}
                  disabled={busy === m.userId}
                  aria-label={isSelf ? s.leave : s.removeAria(m.name)}
                  className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </>
  );
}
