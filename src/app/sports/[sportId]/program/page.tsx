import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import LacrosseProgramView from "@/components/LacrosseProgramView";
import { getLang } from "@/lib/getLang";
import type { Lang } from "@/lib/i18n";
import { soccerProgram, PHASE_I18N, SESSION_I18N } from "@/lib/soccerProgram";
import { L as loc } from "@/lib/localized";

const L: Record<
  Lang,
  {
    back: string;
    title: string;
    subtitle: string;
    sessionPlan: string;
    warmupTitle: string;
    cooldownTitle: string;
  }
> = {
  ko: {
    back: "← 축구",
    title: "⚽ 축구 훈련 프로그램",
    subtitle: "학년별 세션 커리큘럼과 웜업·쿨다운 스트레칭 루틴이에요.",
    sessionPlan: "세션 플랜",
    warmupTitle: "웜업 루틴",
    cooldownTitle: "쿨다운 스트레칭",
  },
  en: {
    back: "← Soccer",
    title: "⚽ Soccer Training Program",
    subtitle: "Session curricula by grade level plus warm-up and cool-down stretching routines.",
    sessionPlan: "Session plan",
    warmupTitle: "Warm-up routine",
    cooldownTitle: "Cool-down stretches",
  },
  es: {
    back: "← Fútbol",
    title: "⚽ Programa de entrenamiento de fútbol",
    subtitle: "Currículos de sesión por nivel escolar más rutinas de calentamiento y estiramientos de vuelta a la calma.",
    sessionPlan: "Plan de sesión",
    warmupTitle: "Rutina de calentamiento",
    cooldownTitle: "Estiramientos de vuelta a la calma",
  },
};

const phaseColors = [
  "border-amber-200 bg-amber-50",
  "border-emerald-200 bg-emerald-50",
  "border-sky-200 bg-sky-50",
  "border-indigo-200 bg-indigo-50",
  "border-rose-200 bg-rose-50",
];

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ sportId: string }>;
}) {
  if (!(await getSession())) redirect("/login");
  const { sportId } = await params;
  const lang = await getLang();
  const s = L[lang];

  if (sportId === "lacrosse") {
    return (
      <>
        <NavBar />
        <LacrosseProgramView sportId={sportId} lang={lang} />
      </>
    );
  }

  if (sportId !== "soccer") notFound();

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link href={`/sports/${sportId}`} className="text-sm text-slate-400 hover:text-slate-600">
          {s.back}
        </Link>

        <header className="mt-3">
          <h1 className="text-2xl font-bold">{s.title}</h1>
          <p className="mt-1 text-slate-500">{s.subtitle}</p>
        </header>

        {/* Grade-level session plans */}
        <div className="mt-6 space-y-8">
          {soccerProgram.sessions.map((session) => (
            <section key={session.title}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-bold">{loc(SESSION_I18N[session.title] ?? session.title, lang)}</h2>
                <span className="badge bg-slate-100 text-slate-500">{s.sessionPlan}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
                {session.phases.map((phase, i) => (
                  <div key={phase.name} className={`rounded-2xl border p-4 ${phaseColors[i % phaseColors.length]}`}>
                    <p className="text-sm font-bold text-slate-800">{loc(PHASE_I18N[phase.name] ?? phase.name, lang)}</p>
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
          <StretchCard title={s.warmupTitle} subtitle="Warm-up / Dynamic" items={soccerProgram.warmup} accent="text-amber-600" />
          <StretchCard title={s.cooldownTitle} subtitle="Cool-down" items={soccerProgram.cooldown} accent="text-emerald-600" />
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
              {it.variations.length > 0 && <span className="text-slate-400"> · {it.variations.join(", ")}</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
