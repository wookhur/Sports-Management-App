import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import PrintButton from "@/components/PrintButton";
import LacrosseProgramView from "@/components/LacrosseProgramView";
import SportIcon from "@/components/sportIcons";
import { getSport } from "@/lib/sports";
import { getLang } from "@/lib/getLang";
import type { Lang } from "@/lib/i18n";
import { soccerProgram, PHASE_I18N, SESSION_I18N } from "@/lib/soccerProgram";
import { sessionSpans } from "@/lib/programTime";
import { L as loc } from "@/lib/localized";

const L: Record<
  Lang,
  {
    back: string;
    title: string;
    subtitle: string;
    print: string;
    sessionTotal: (n: number) => string;
    drillCount: (n: number) => string;
    howTheTimeSplits: string;
    warmupTitle: string;
    warmupSub: string;
    cooldownTitle: string;
    cooldownSub: string;
  }
> = {
  ko: {
    back: "← 축구",
    title: "축구 훈련 프로그램",
    subtitle: "학년별 세션 커리큘럼과 웜업·쿨다운 스트레칭 루틴이에요.",
    print: "인쇄",
    sessionTotal: (n) => `${n}분 세션`,
    drillCount: (n) => `드릴 ${n}개`,
    howTheTimeSplits: "시간 배분",
    warmupTitle: "웜업 루틴",
    warmupSub: "동적 스트레칭 · 훈련 전",
    cooldownTitle: "쿨다운 스트레칭",
    cooldownSub: "정적 스트레칭 · 훈련 후",
  },
  en: {
    back: "← Soccer",
    title: "Soccer Training Program",
    subtitle: "Session curricula by grade level plus warm-up and cool-down stretching routines.",
    print: "Print",
    sessionTotal: (n) => `${n}-minute session`,
    drillCount: (n) => `${n} drill${n === 1 ? "" : "s"}`,
    howTheTimeSplits: "How the time splits",
    warmupTitle: "Warm-up routine",
    warmupSub: "Dynamic · before training",
    cooldownTitle: "Cool-down stretches",
    cooldownSub: "Static · after training",
  },
  es: {
    back: "← Fútbol",
    title: "Programa de entrenamiento de fútbol",
    subtitle:
      "Currículos de sesión por nivel escolar más rutinas de calentamiento y estiramientos de vuelta a la calma.",
    print: "Imprimir",
    sessionTotal: (n) => `Sesión de ${n} minutos`,
    drillCount: (n) => `${n} ejercicio${n === 1 ? "" : "s"}`,
    howTheTimeSplits: "Reparto del tiempo",
    warmupTitle: "Rutina de calentamiento",
    warmupSub: "Dinámico · antes de entrenar",
    cooldownTitle: "Estiramientos de vuelta a la calma",
    cooldownSub: "Estático · después de entrenar",
  },
};

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
  const sport = getSport(sportId);
  const accent = sport?.accent ?? "#475569";
  const accentText = sport?.accentText ?? "#334155";

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
        <Link
          href={`/sports/${sportId}`}
          className="no-print text-sm text-slate-500 hover:text-slate-600"
        >
          {s.back}
        </Link>

        <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${accent}1a`, color: accentText }}
            >
              <SportIcon sportId={sportId} className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold">{s.title}</h1>
              <p className="mt-1 text-slate-600">{s.subtitle}</p>
            </div>
          </div>
          {/* A session plan is used at the side of a pitch, not at a desk. */}
          <PrintButton label={s.print} />
        </header>

        <div className="mt-8 space-y-10">
          {soccerProgram.sessions.map((session) => (
            <SessionPlan
              key={session.title}
              session={session}
              lang={lang}
              s={s}
              accent={accent}
              accentText={accentText}
            />
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <StretchCard
            title={s.warmupTitle}
            subtitle={s.warmupSub}
            items={soccerProgram.warmup}
            accentText={accentText}
          />
          <StretchCard
            title={s.cooldownTitle}
            subtitle={s.cooldownSub}
            items={soccerProgram.cooldown}
            accentText={accentText}
          />
        </div>
      </main>
    </>
  );
}

/**
 * One grade band's session.
 *
 * The five phases used to be five equal columns in a grid, which meant every
 * card grew to the height of the longest — "Coordination" has one drill and
 * "Mini game" has eight, so most of the row was empty — while the longest drill
 * names spilled out of their column. They are rows now: a row is as tall as its
 * own content, and a long name has the width to sit in.
 */
function SessionPlan({
  session,
  lang,
  s,
  accent,
  accentText,
}: {
  session: { title: string; phases: { name: string; time: string | null; items: string[] }[] };
  lang: Lang;
  s: (typeof L)[Lang];
  accent: string;
  accentText: string;
}) {
  const { totalMinutes, spans } = sessionSpans(session.phases.map((p) => p.time));
  const drills = session.phases.reduce((n, p) => n + p.items.length, 0);

  return (
    <section className="card overflow-hidden">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-bold">
          {loc(SESSION_I18N[session.title] ?? session.title, lang)}
        </h2>
        <p className="text-sm text-slate-600">
          {totalMinutes != null && (
            <span className="font-semibold" style={{ color: accentText }}>
              {s.sessionTotal(totalMinutes)}
            </span>
          )}
          {totalMinutes != null && " · "}
          {s.drillCount(drills)}
        </p>
      </header>

      {/* Proportions at a glance: 40 of the 90 minutes is the mini game, and
          you can see that without adding up five numbers. Decorative only —
          every figure it encodes is printed in the rows underneath. */}
      {totalMinutes != null && (
        <div className="px-5 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {s.howTheTimeSplits}
          </p>
          <div aria-hidden="true" className="mt-1.5 flex h-2.5 gap-0.5 overflow-hidden rounded-full">
            {session.phases.map((phase, i) => (
              <span
                key={phase.name}
                className="first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${spans[i].share * 100}%`,
                  // Stepped alpha rather than five different hues: it reads as
                  // one session split five ways, not five unrelated things.
                  backgroundColor: `${accent}${ALPHA[i % ALPHA.length]}`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <ol className="divide-y divide-slate-100">
        {session.phases.map((phase, i) => (
          <li key={phase.name} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-5">
            <div className="flex shrink-0 items-baseline gap-2 sm:w-40 sm:flex-col sm:items-start sm:gap-0.5">
              <p className="font-semibold text-slate-800">
                {loc(PHASE_I18N[phase.name] ?? phase.name, lang)}
              </p>
              {spans[i].minutes != null && (
                <p className="text-sm tabular-nums text-slate-500">
                  {spans[i].minutes} min
                </p>
              )}
            </div>
            <ul
              className={`min-w-0 flex-1 space-y-1 text-sm text-slate-700 ${
                phase.items.length >= 4 ? "sm:columns-2 sm:gap-6" : ""
              }`}
            >
              {phase.items.map((item, j) => (
                <li key={j} className="flex gap-2 break-inside-avoid leading-snug">
                  <span aria-hidden="true" className="select-none text-slate-300">
                    –
                  </span>
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

// Hex alpha suffixes, lightest first — the bar reads left to right in order.
const ALPHA = ["40", "59", "73", "a6", "d9"];

function StretchCard({
  title,
  subtitle,
  items,
  accentText,
}: {
  title: string;
  subtitle: string;
  items: { name: string; variations: string[] }[];
  accentText: string;
}) {
  return (
    <div className="card break-inside-avoid p-5">
      <div className="mb-3">
        <h3 className="font-bold">{title}</h3>
        <p className="text-xs font-medium" style={{ color: accentText }}>
          {subtitle}
        </p>
      </div>
      <ol className="space-y-1.5 sm:columns-2 sm:gap-6 md:columns-1 lg:columns-2">
        {items.map((it, i) => (
          <li key={i} className="flex break-inside-avoid gap-2.5 text-sm leading-snug">
            <span className="w-4 shrink-0 text-right text-xs tabular-nums text-slate-500">
              {i + 1}
            </span>
            <span className="min-w-0 text-slate-700">
              {it.name}
              {it.variations.length > 0 && (
                <span className="text-slate-500"> · {it.variations.join(", ")}</span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
