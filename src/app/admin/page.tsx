import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

// Read-only operations overview for coaches: who's signed up, how active
// they are, and what content exists. Destructive user management is
// deliberately out of scope — coaches are not account admins.

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "COACH") redirect("/");

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
        <h1 className="text-2xl font-bold">운영 현황</h1>
        <p className="mt-1 text-slate-500">가입자와 콘텐츠 현황을 한눈에 확인하세요.</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="전체 사용자" value={`${users.length}명`} />
          <Stat label="측정된 기록" value={`${recordCount}건`} />
          <Stat label="블로그 글" value={`${postCount}개`} />
          <Stat label="스타 루틴" value={`${guideCount}개`} />
          <Stat label="팀" value={`${teamCount}개`} />
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">사용자</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-semibold">이름</th>
                  <th className="px-5 py-3 font-semibold">이메일</th>
                  <th className="px-5 py-3 font-semibold">역할</th>
                  <th className="px-5 py-3 text-right font-semibold">기록</th>
                  <th className="px-5 py-3 text-right font-semibold">연속 출석</th>
                  <th className="px-5 py-3 text-right font-semibold">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className={u.id === session.userId ? "bg-brand/5" : ""}>
                    <td className="px-5 py-3 font-medium">{u.name}</td>
                    <td className="px-5 py-3 text-slate-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${u.role === "COACH" ? "bg-brand/10 text-brand" : "bg-emerald-50 text-emerald-600"}`}>
                        {u.role === "COACH" ? "코치" : "선수"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{u._count.records}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {u.currentStreak > 0 ? `🔥 ${u.currentStreak}일` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-slate-400">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-4 text-xs text-slate-400">
          블로그 글과 스타 루틴 관리(수정/삭제)는 각 글의 페이지에서 할 수 있어요.{" "}
          <Link href="/blog" className="text-brand hover:underline">블로그 →</Link>
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
