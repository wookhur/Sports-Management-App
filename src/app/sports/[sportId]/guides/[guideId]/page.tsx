import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getSport, getGuide } from "@/lib/sports";
import NavBar from "@/components/NavBar";

const levelColors: Record<string, string> = {
  입문: "bg-emerald-50 text-emerald-600",
  중급: "bg-amber-50 text-amber-600",
  고급: "bg-rose-50 text-rose-600",
};

export default async function GuidePage({
  params,
}: {
  params: Promise<{ sportId: string; guideId: string }>;
}) {
  if (!(await getSession())) redirect("/login");

  const { sportId, guideId } = await params;
  const sport = getSport(sportId);
  const guide = getGuide(sportId, guideId);
  if (!sport || !guide) notFound();

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href={`/sports/${sportId}`} className="text-sm text-slate-400 hover:text-slate-600">
          ← {sport.name}
        </Link>

        <header className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${levelColors[guide.level]}`}>{guide.level}</span>
            <span className="badge bg-slate-100 text-slate-500">⏱ {guide.durationMin}분</span>
            <span className="badge bg-slate-100 text-slate-500">🎯 {guide.focus}</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            {sport.emoji} {guide.title}
          </h1>
          <p className="mt-2 text-slate-600">{guide.summary}</p>
        </header>

        {/* Steps */}
        <section className="mt-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            단계별 훈련
          </h2>
          <ol className="space-y-3">
            {guide.steps.map((step, i) => (
              <li key={i} className="card flex gap-4 p-5">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${sport.gradient} font-bold text-white`}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-0.5 text-sm text-slate-600">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Tips */}
        {guide.tips.length > 0 && (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-semibold text-amber-800">💡 코칭 포인트</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-amber-900">
              {guide.tips.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span>·</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
