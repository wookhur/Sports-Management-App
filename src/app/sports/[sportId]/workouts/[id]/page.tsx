import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import { getLang } from "@/lib/getLang";
import type { Lang } from "@/lib/i18n";
import { getWorkout, getVideo, strokeLabel, levelLabel } from "@/lib/swimming";

const phaseAccent: Record<string, string> = {
  "Warm-up": "from-sky-500 to-cyan-500",
  Drill: "from-violet-500 to-purple-500",
  "Main Set A": "from-blue-600 to-indigo-600",
  "Main Set B": "from-indigo-600 to-blue-700",
  "Cool-down": "from-teal-500 to-emerald-500",
};

const PHASE_LABELS: Record<Lang, Record<string, string>> = {
  ko: {
    "Warm-up": "웜업",
    Drill: "드릴",
    "Main Set A": "메인 세트 A",
    "Main Set B": "메인 세트 B",
    "Cool-down": "쿨다운",
  },
  en: {
    "Warm-up": "Warm-up",
    Drill: "Drill",
    "Main Set A": "Main Set A",
    "Main Set B": "Main Set B",
    "Cool-down": "Cool-down",
  },
  es: {
    "Warm-up": "Calentamiento",
    Drill: "Ejercicio",
    "Main Set A": "Serie principal A",
    "Main Set B": "Serie principal B",
    "Cool-down": "Vuelta a la calma",
  },
};

const L: Record<
  Lang,
  {
    back: string;
    baseLabel: (base: number) => string;
    totalDistance: (m: number) => string;
    phaseCount: (n: number) => string;
    skillsLabel: string;
    trackRecords: string;
  }
> = {
  ko: {
    back: "← 훈련 프로그램",
    baseLabel: (base) => `${base}m 기준`,
    totalDistance: (m) => `총 ${m.toLocaleString()}m`,
    phaseCount: (n) => `${n}단계`,
    skillsLabel: "향상 포인트",
    trackRecords: "⏱️ 이 종목에서 기록 측정하기",
  },
  en: {
    back: "← Training programs",
    baseLabel: (base) => `${base}m base`,
    totalDistance: (m) => `${m.toLocaleString()}m total`,
    phaseCount: (n) => `${n} phases`,
    skillsLabel: "Skills improved",
    trackRecords: "⏱️ Track your times in this sport",
  },
  es: {
    back: "← Programas de entrenamiento",
    baseLabel: (base) => `base de ${base}m`,
    totalDistance: (m) => `${m.toLocaleString()}m en total`,
    phaseCount: (n) => `${n} fases`,
    skillsLabel: "Habilidades que mejora",
    trackRecords: "⏱️ Registra tus tiempos en este deporte",
  },
};

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ sportId: string; id: string }>;
}) {
  if (!(await getSession())) redirect("/login");
  const { sportId, id } = await params;
  if (sportId !== "swimming") notFound();
  const workout = await getWorkout(id);
  if (!workout) notFound();
  const lang = await getLang();
  const s = L[lang];
  const phaseLabel = PHASE_LABELS[lang];

  const total = workout.phases.reduce((sum, p) => sum + (p.distanceM || 0), 0);

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href={`/sports/${sportId}/workouts`} className="text-sm text-slate-400 hover:text-slate-600">
          {s.back}
        </Link>

        <header className="mt-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white">
          <span className="font-mono text-xs text-white/80">{workout.id}</span>
          <h1 className="mt-1 text-2xl font-bold">
            {strokeLabel(workout.stroke, lang)} · {s.baseLabel(workout.base)}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="badge bg-white/20 text-white">{levelLabel(workout.level, lang)}</span>
            <span className="badge bg-white/20 text-white">{s.totalDistance(total)}</span>
            <span className="badge bg-white/20 text-white">{s.phaseCount(workout.phases.length)}</span>
          </div>
        </header>

        <ol className="mt-6 space-y-4">
          {workout.phases.map((p, i) => {
            const video = getVideo(p.video);
            const howTo = p.howTo ?? video?.howTo;
            const skills = p.skills ?? video?.skills;
            const source = p.source ?? video?.source;
            return (
              <li key={i} className="card overflow-hidden">
                <div className={`bg-gradient-to-r ${phaseAccent[p.phase] ?? "from-slate-500 to-slate-600"} px-5 py-2.5`}>
                  <div className="flex items-center justify-between text-white">
                    <span className="font-bold">{phaseLabel[p.phase] ?? p.phase}</span>
                    <span className="text-sm text-white/90">{p.distanceM}m</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-lg font-semibold">{p.set}</p>
                    <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {p.effort}
                    </span>
                  </div>
                  {howTo && <p className="mt-2 text-sm leading-relaxed text-slate-600">{howTo}</p>}
                  {skills && (
                    <p className="mt-2 text-xs text-slate-400">
                      <span className="font-medium">{s.skillsLabel}</span> · {skills}
                    </p>
                  )}
                  {video && (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                    >
                      ▶ {video.name}
                      <span className="text-xs text-slate-400">({source})</span>
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <Link
          href={`/sports/${sportId}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {s.trackRecords}
        </Link>
      </main>
    </>
  );
}
