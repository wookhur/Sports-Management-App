import type { LeaderRow, StreakInfo } from "@/lib/streak";

// Server component — streak summary + a small "most active" leaderboard.
export default function StreakCard({
  streak,
  leaders,
  myName,
}: {
  streak: StreakInfo;
  leaders: LeaderRow[];
  myName: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
      {/* Personal streak */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 p-5 text-white">
        <p className="text-sm text-white/85">연속 출석</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-4xl font-extrabold tabular-nums">{streak.current}</span>
          <span className="mb-1 text-lg font-semibold">일 🔥</span>
        </div>
        <p className="mt-2 text-sm text-white/85">
          최고 기록 {streak.longest}일
          {streak.advancedToday && streak.current > 1 ? " · 오늘도 출석 완료!" : ""}
        </p>
      </div>

      {/* Leaderboard */}
      <div className="card p-5">
        <p className="mb-2 text-sm font-semibold text-slate-500">🏆 연속 출석 순위</p>
        <ol className="space-y-1.5">
          {leaders.length === 0 && <li className="text-sm text-slate-400">아직 순위가 없어요.</li>}
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
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={isMe ? "font-bold text-brand" : "text-slate-700"}>
                    {l.name}
                    {isMe && " (나)"}
                  </span>
                </span>
                <span className="font-mono font-semibold text-slate-600">{l.currentStreak}일 🔥</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
