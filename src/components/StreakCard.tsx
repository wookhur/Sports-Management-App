import type { LeaderRow, StreakInfo } from "@/lib/streak";
import type { Lang } from "@/lib/i18n";

const L: Record<
  Lang,
  {
    streakLabel: string;
    daysUnit: (n: number) => string;
    best: (n: number) => string;
    todayDone: string;
    leaderboardTitle: string;
    leaderboardEmpty: string;
    me: string;
    leaderDays: (n: number) => string;
  }
> = {
  ko: {
    streakLabel: "연속 출석",
    daysUnit: () => "일 🔥",
    best: (n) => `최고 기록 ${n}일`,
    todayDone: " · 오늘도 출석 완료!",
    leaderboardTitle: "🏆 연속 출석 순위",
    leaderboardEmpty: "아직 순위가 없어요.",
    me: " (나)",
    leaderDays: (n) => `${n}일 🔥`,
  },
  en: {
    streakLabel: "Attendance streak",
    daysUnit: (n) => (n === 1 ? "day 🔥" : "days 🔥"),
    best: (n) => `Best: ${n} ${n === 1 ? "day" : "days"}`,
    todayDone: " · Checked in today!",
    leaderboardTitle: "🏆 Streak leaderboard",
    leaderboardEmpty: "No rankings yet.",
    me: " (me)",
    leaderDays: (n) => `${n}d 🔥`,
  },
  es: {
    streakLabel: "Racha de asistencia",
    daysUnit: (n) => (n === 1 ? "día 🔥" : "días 🔥"),
    best: (n) => `Mejor racha: ${n} ${n === 1 ? "día" : "días"}`,
    todayDone: " · ¡Ya asististe hoy!",
    leaderboardTitle: "🏆 Ranking de rachas",
    leaderboardEmpty: "Aún no hay clasificación.",
    me: " (yo)",
    leaderDays: (n) => `${n}d 🔥`,
  },
};

// Server component — streak summary + a small "most active" leaderboard.
export default function StreakCard({
  streak,
  leaders,
  myName,
  lang = "ko",
}: {
  streak: StreakInfo;
  leaders: LeaderRow[];
  myName: string;
  lang?: Lang;
}) {
  const s = L[lang];
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
      {/* Personal streak */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 p-5 text-white">
        <p className="text-sm text-white/85">{s.streakLabel}</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-4xl font-extrabold tabular-nums">{streak.current}</span>
          <span className="mb-1 text-lg font-semibold">{s.daysUnit(streak.current)}</span>
        </div>
        <p className="mt-2 text-sm text-white/85">
          {s.best(streak.longest)}
          {streak.advancedToday && streak.current > 1 ? s.todayDone : ""}
        </p>
      </div>

      {/* Leaderboard */}
      <div className="card p-5">
        <p className="mb-2 text-sm font-semibold text-slate-500">{s.leaderboardTitle}</p>
        <ol className="space-y-1.5">
          {leaders.length === 0 && <li className="text-sm text-slate-500">{s.leaderboardEmpty}</li>}
          {leaders.map((l, i) => {
            const isMe = l.name === myName;
            return (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : i === 1
                        ? "bg-slate-200 text-slate-600"
                        : i === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={isMe ? "font-bold text-brand" : "text-slate-700"}>
                    {l.name}
                    {isMe && s.me}
                  </span>
                </span>
                <span className="font-mono font-semibold text-slate-600">{s.leaderDays(l.currentStreak)}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
