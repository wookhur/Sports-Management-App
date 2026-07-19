import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import { formatDate } from "@/lib/format";
import type { Lang } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

const L: Record<
  Lang,
  {
    title: string;
    sub: string;
    statUsers: string;
    statRecords: string;
    statPosts: string;
    statGuides: string;
    statTeams: string;
    userCount: (n: number) => string;
    recordCount: (n: number) => string;
    itemCount: (n: number) => string;
    usersHeading: string;
    thName: string;
    thEmail: string;
    thRole: string;
    thRecords: string;
    thStreak: string;
    thJoined: string;
    roleCoach: string;
    roleAthlete: string;
    streakDays: (n: number) => string;
    footerNote: string;
    footerLink: string;
  }
> = {
  ko: {
    title: "운영 현황",
    sub: "가입자와 콘텐츠 현황을 한눈에 확인하세요.",
    statUsers: "전체 사용자",
    statRecords: "측정된 기록",
    statPosts: "블로그 글",
    statGuides: "스타 루틴",
    statTeams: "팀",
    userCount: (n) => `${n}명`,
    recordCount: (n) => `${n}건`,
    itemCount: (n) => `${n}개`,
    usersHeading: "사용자",
    thName: "이름",
    thEmail: "이메일",
    thRole: "역할",
    thRecords: "기록",
    thStreak: "연속 출석",
    thJoined: "가입일",
    roleCoach: "코치",
    roleAthlete: "선수",
    streakDays: (n) => `🔥 ${n}일`,
    footerNote: "블로그 글과 스타 루틴 관리(수정/삭제)는 각 글의 페이지에서 할 수 있어요.",
    footerLink: "블로그 →",
  },
  en: {
    title: "Operations",
    sub: "See sign-ups and content at a glance.",
    statUsers: "Total users",
    statRecords: "Records logged",
    statPosts: "Blog posts",
    statGuides: "Star routines",
    statTeams: "Teams",
    userCount: (n) => `${n}`,
    recordCount: (n) => `${n}`,
    itemCount: (n) => `${n}`,
    usersHeading: "Users",
    thName: "Name",
    thEmail: "Email",
    thRole: "Role",
    thRecords: "Records",
    thStreak: "Streak",
    thJoined: "Joined",
    roleCoach: "Coach",
    roleAthlete: "Athlete",
    streakDays: (n) => `🔥 ${n} day${n === 1 ? "" : "s"}`,
    footerNote: "You can edit or delete blog posts and star routines from each post's page.",
    footerLink: "Blog →",
  },
  es: {
    title: "Operaciones",
    sub: "Consulta los registros y el contenido de un vistazo.",
    statUsers: "Usuarios totales",
    statRecords: "Marcas registradas",
    statPosts: "Entradas del blog",
    statGuides: "Rutinas de estrellas",
    statTeams: "Equipos",
    userCount: (n) => `${n}`,
    recordCount: (n) => `${n}`,
    itemCount: (n) => `${n}`,
    usersHeading: "Usuarios",
    thName: "Nombre",
    thEmail: "Correo",
    thRole: "Rol",
    thRecords: "Marcas",
    thStreak: "Racha",
    thJoined: "Alta",
    roleCoach: "Entrenador",
    roleAthlete: "Atleta",
    streakDays: (n) => `🔥 ${n} día${n === 1 ? "" : "s"}`,
    footerNote: "Puedes editar o eliminar las entradas del blog y las rutinas de estrellas desde la página de cada una.",
    footerLink: "Blog →",
  },
};

// Read-only operations overview for coaches: who's signed up, how active
// they are, and what content exists. Destructive user management is
// deliberately out of scope — coaches are not account admins.

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "COACH") redirect("/");

  const lang = await getLang();
  const s = L[lang];

  const [users, recordCount, postCount, guideCount, teamCount] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        currentStreak: true,
        createdAt: true,
        _count: { select: { records: true } },
      },
    }),
    prisma.record.count(),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.athleteGuide.count({ where: { published: true } }),
    prisma.team.count(),
  ]);

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold">{s.title}</h1>
        <p className="mt-1 text-slate-500">{s.sub}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label={s.statUsers} value={s.userCount(users.length)} />
          <Stat label={s.statRecords} value={s.recordCount(recordCount)} />
          <Stat label={s.statPosts} value={s.itemCount(postCount)} />
          <Stat label={s.statGuides} value={s.itemCount(guideCount)} />
          <Stat label={s.statTeams} value={s.itemCount(teamCount)} />
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">{s.usersHeading}</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-semibold">{s.thName}</th>
                  <th className="px-5 py-3 font-semibold">{s.thEmail}</th>
                  <th className="px-5 py-3 font-semibold">{s.thRole}</th>
                  <th className="px-5 py-3 text-right font-semibold">{s.thRecords}</th>
                  <th className="px-5 py-3 text-right font-semibold">{s.thStreak}</th>
                  <th className="px-5 py-3 text-right font-semibold">{s.thJoined}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className={u.id === session.userId ? "bg-brand/5" : ""}>
                    <td className="px-5 py-3 font-medium">{u.name}</td>
                    <td className="px-5 py-3 text-slate-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${u.role === "COACH" ? "bg-brand/10 text-brand" : "bg-emerald-50 text-emerald-600"}`}>
                        {u.role === "COACH" ? s.roleCoach : s.roleAthlete}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{u._count.records}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {u.currentStreak > 0 ? s.streakDays(u.currentStreak) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-slate-400">{formatDate(u.createdAt, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-4 text-xs text-slate-400">
          {s.footerNote}{" "}
          <Link href="/blog" className="text-brand hover:underline">{s.footerLink}</Link>
        </p>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
