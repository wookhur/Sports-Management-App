import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SPORT_LIST } from "@/lib/sports";
import { EXPERIENCE_LEVELS, GRADE_OPTIONS } from "@/lib/onboarding";
import { computeBadges } from "@/lib/badges";
import NavBar from "@/components/NavBar";
import BadgeRow from "@/components/BadgeRow";
import ProfileEditor, { type ProfileData } from "@/components/ProfileEditor";
import HomeSettings from "@/components/HomeSettings";
import ResearchConsent from "@/components/ResearchConsent";
import { HOME_WIDGETS } from "@/lib/homeWidgets";
import { SPORT_I18N, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

const L: Record<
  Lang,
  {
    roleCoach: string;
    roleAthlete: string;
    statRecords: string;
    nRecords: (n: number) => string;
    statStreak: string;
    statLongest: string;
    nDays: (n: number) => string;
    badges: string;
    earned: (earned: number, total: number) => string;
  }
> = {
  ko: {
    roleCoach: "코치",
    roleAthlete: "선수",
    statRecords: "측정한 기록",
    nRecords: (n) => `${n}건`,
    statStreak: "연속 출석",
    statLongest: "최장 출석",
    nDays: (n) => `${n}일`,
    badges: "배지",
    earned: (earned, total) => `· ${earned}/${total} 획득`,
  },
  en: {
    roleCoach: "Coach",
    roleAthlete: "Athlete",
    statRecords: "Records logged",
    nRecords: (n) => `${n}`,
    statStreak: "Current streak",
    statLongest: "Longest streak",
    nDays: (n) => `${n} days`,
    badges: "Badges",
    earned: (earned, total) => `· ${earned}/${total} earned`,
  },
  es: {
    roleCoach: "Entrenador",
    roleAthlete: "Atleta",
    statRecords: "Marcas registradas",
    nRecords: (n) => `${n}`,
    statStreak: "Racha actual",
    statLongest: "Racha más larga",
    nDays: (n) => `${n} días`,
    badges: "Insignias",
    earned: (earned, total) => `· ${earned}/${total} conseguidas`,
  },
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const t = L[lang];

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
      homeHidden: true,
      researchConsent: true,
      createdAt: true,
      _count: { select: { records: true } },
    },
  });
  if (!user) redirect("/login");

  const badges = await computeBadges(session.userId, lang);
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
              <span className={`badge ${isCoach ? "bg-brand/10 text-brand-dark" : "bg-emerald-50 text-emerald-700"}`}>
                {isCoach ? t.roleCoach : t.roleAthlete}
              </span>
            </p>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-500">{t.statRecords}</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{t.nRecords(user._count.records)}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-500">{t.statStreak}</p>
            <p className="mt-1 text-xl font-bold tabular-nums">🔥 {t.nDays(user.currentStreak)}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-slate-500">{t.statLongest}</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{t.nDays(user.longestStreak)}</p>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t.badges} <span className="font-normal normal-case text-slate-500">{t.earned(badges.filter((b) => b.earned).length, badges.length)}</span>
          </h2>
          <BadgeRow badges={badges} />
        </section>

        <section className="mt-8">
          <ProfileEditor
            lang={lang}
            initial={initial}
            gradeOptions={[...GRADE_OPTIONS]}
            experienceOptions={EXPERIENCE_LEVELS.map((l) => ({ value: l.value, label: l.label }))}
            sportOptions={SPORT_LIST.map((s) => ({
              id: s.id,
              name: SPORT_I18N[s.id]?.[lang]?.name ?? s.name,
            }))}
          />
        </section>

        <section className="mt-6">
          <HomeSettings lang={lang} widgets={[...HOME_WIDGETS]} initialHidden={user.homeHidden} />
        </section>

        <ResearchConsent lang={lang} consent={user.researchConsent} />
      </main>
    </>
  );
}
