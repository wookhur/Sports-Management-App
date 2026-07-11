import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import DrillDiagram from "@/components/DrillDiagram";
import { getDrill, ageLabel } from "@/lib/soccerDrills";

export default async function DrillDetailPage({
  params,
}: {
  params: Promise<{ sportId: string; drillId: string }>;
}) {
  if (!(await getSession())) redirect("/login");
  const { sportId, drillId } = await params;
  if (sportId !== "soccer") notFound();
  const drill = getDrill(drillId);
  if (!drill) notFound();

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href={`/sports/${sportId}/drills`} className="text-sm text-slate-400 hover:text-slate-600">
          ← 축구 드릴
        </Link>

        <header className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-indigo-50 text-indigo-600">{drill.category}</span>
            {drill.ageLevels.map((a) => (
              <span key={a} className="badge bg-slate-100 text-slate-500">
                {ageLabel(a)}
              </span>
            ))}
            <span className="badge bg-slate-100 text-slate-500">⏱ {drill.durationMin}분</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{drill.title}</h1>
          <p className="mt-2 text-slate-600">{drill.summary}</p>
          <p className="mt-1 text-sm text-slate-400">👥 {drill.players}</p>
        </header>

        {/* Diagram */}
        <div className="mt-6 rounded-2xl bg-slate-900 p-3">
          <DrillDiagram spec={drill.diagram} />
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 px-1 pb-1 text-[11px] text-slate-300">
            <Legend color="#2563eb" label="공격" />
            <Legend color="#ef4444" label="수비" />
            <Legend color="#e2e8f0" label="골키퍼/중립" />
            <Legend color="#f97316" label="콘" />
            <span className="flex items-center gap-1">
              <span className="inline-block h-0.5 w-4 bg-blue-400" style={{ borderTop: "2px dashed #60a5fa" }} /> 패스
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-0.5 w-4 bg-white" /> 런/드리블
            </span>
          </div>
        </div>

        {/* Steps */}
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">진행 방법</h2>
          <ol className="space-y-3">
            {drill.steps.map((s, i) => (
              <li key={i} className="card flex gap-4 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 font-bold text-white">
                  {i + 1}
                </span>
                <p className="pt-1 text-sm text-slate-700">{s}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Coaching points */}
        {drill.coaching.length > 0 && (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-semibold text-amber-800">💡 코칭 포인트</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-amber-900">
              {drill.coaching.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span>·</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
