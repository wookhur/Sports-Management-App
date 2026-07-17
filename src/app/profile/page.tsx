import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SPORT_LIST } from "@/lib/sports";
import { EXPERIENCE_LEVELS, GRADE_OPTIONS } from "@/lib/onboarding";
import { computeBadges } from "@/lib/badges";
import NavBar from "@/components/NavBar";
import BadgeRow from "@/components/BadgeRow";
import ProfileEditor, { type ProfileData } from "@/components/ProfileEditor";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      role: true,
      username: true,
      school: true,
      grade: true,
      dob: true,
      experienceLevel: true,
      sportInterests: true,
      currentStreak: true,
      longestStreak: true,
      createdAt: true,
      _count: { select: { records: true } },
    },
  });
  if (!user) redirect("/login");

  const badges = await computeBadges(session.userId);
  const isCoach = user.role === "COACH";

  const initial: ProfileData = {
    name: user.name,
    username: user.username ?? "",
    school: user.school ?? "",
    grade: user.grade ?? "",
    dob: user.dob ? user.dob.toISOString().slice(0, 10) : "",
    experienceLevel: user.experienceLevel ?? "",
    sportInterests: user.sportInterests,
  };

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <header className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-2xl font-bold text-brand">
            {user.name.slice(0, 1)}
          </span>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-slate-500">
              {user.email} ·{" "}
              <span className={`badge ${isCoach ? "bg-brand/10 text-brand" : "bg-emerald-50 text-emerald-600"}`}>
                {isCoach ? "코치" : "선수"}
              </span>
            </p>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-400">측정한 기록</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{user._count.records}건</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-400">연속 출석</p>
            <p className="mt-1 text-xl font-bold tabular-nums">🔥 {user.currentStreak}일</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-400">최장 출석</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{user.longestStreak}일</p>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            배지 <span className="font-normal normal-case text-slate-300">· {badges.filter((b) => b.earned).length}/{badges.length} 획득</span>
          </h2>
          <BadgeRow badges={badges} />
        </section>

        <section className="mt-8">
          <ProfileEditor
            initial={initial}
            gradeOptions={[...GRADE_OPTIONS]}
            experienceOptions={EXPERIENCE_LEVELS.map((l) => ({ value: l.value, label: l.label }))}
            sportOptions={SPORT_LIST.map((s) => ({ id: s.id, name: s.name, emoji: s.emoji }))}
          />
        </section>
      </main>
    </>
  );
}
