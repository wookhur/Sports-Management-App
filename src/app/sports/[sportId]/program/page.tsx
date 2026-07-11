import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import { soccerProgram, PHASE_KO } from "@/lib/soccerProgram";

const phaseColors = [
  "border-amber-200 bg-amber-50",
  "border-emerald-200 bg-emerald-50",
  "border-sky-200 bg-sky-50",
  "border-indigo-200 bg-indigo-50",
  "border-rose-200 bg-rose-50",
];

export default async function SoccerProgramPage({
  params,
}: {
  params: Promise<{ sportId: string }>;
}) {
  if (!(await getSession())) redirect("/login");
  const { sportId } = await params;
  if (sportId !== "soccer") notFound();

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link href={`/sports/${sportId}`} className="text-sm text-slate-400 hover:text-slate-600">
          ← 축구
        </Link>

        <header className="mt-3">
          <h1 className="text-2xl font-bold">⚽ 축구 훈련 프로그램</h1>
          <p className="mt-1 text-slate-500">
            학년별 세션 커리큘럼과 웜업·쿨다운 스트레칭 루틴이에요.
          </p>
        </header>

        {/* Grade-level session plans */}
        <div className="mt-6 space-y-8">
          {soccerProgram.sessions.map((s) => (
            <section key={s.title}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-bold">{s.title}</h2>
                <span className="badge bg-slate-100 text-slate-500">세션 플랜</span>
              </div>
              <div className="grid gap-3 md:grid-cols-5 sm:grid-cols-2">
                {s.phases.map((phase, i) => (
                  <div key={phase.name} className={`rounded-2xl border p-4 ${phaseColors[i % phaseColors.length]}`}>
                    <p className="text-sm font-bold text-slate-800">{PHASE_KO[phase.name] ?? phase.name}</p>
                    {phase.time && <p className="text-xs font-medium text-slate-500">{phase.time}</p>}
                    <ul className="mt-2 space-y-1">
                      {phase.items.map((item, j) => (
                        <li key={j} className="text-sm leading-snug text-slate-700">
                          · {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Warm-up + cool-down routines */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <StretchCard title="웜업 루틴" subtitle="Warm-up / Dynamic" items={soccerProgram.warmup} accent="text-amber-600" />
          <StretchCard title="쿨다운 스트레칭" subtitle="Cool-down" items={soccerProgram.cooldown} accent="text-emerald-600" />
        </div>
      </main>
    </>
  );
}

function StretchCard({
  title,
  subtitle,
  items,
  accent,
}: {
  title: string;
  subtitle: string;
  items: { name: string; variations: string[] }[];
  accent: string;
}) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-bold">{title}</h3>
        <span className={`text-xs font-medium ${accent}`}>{subtitle}</span>
      </div>
      <ol className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="w-5 shrink-0 text-right font-mono text-xs text-slate-300">{i + 1}</span>
            <span className="text-slate-700">
              {it.name}
              {it.variations.length > 0 && (
                <span className="text-slate-400"> · {it.variations.join(", ")}</span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
