import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { L as loc, type Localized } from "@/lib/localized";
import {
  LAX_META,
  LAX_PRINCIPLES,
  LAX_QUOTE,
  LAX_WARMUP,
  LAX_STICK,
  LAX_CONDITIONING,
  LAX_CONDITIONING_NOTE,
  LAX_TEAM,
  LAX_PRACTICE_90,
  LAX_PRACTICE_120,
  LAX_PREGAME,
  LAX_PREGAME_NOTE,
  LAX_POSITIONS,
  LAX_WEEKLY,
  LAX_STRENGTH,
  LAX_VIDEOS,
  LAX_HABITS,
  type NamedItem,
} from "@/lib/lacrosseProgram";

const NAV_IDS = [
  "philosophy",
  "warmup",
  "stick",
  "conditioning",
  "team",
  "structure",
  "pregame",
  "position",
  "weekly",
  "strength",
  "videos",
  "habits",
] as const;

type NavId = (typeof NAV_IDS)[number];

const L: Record<
  Lang,
  {
    back: string;
    nav: Record<NavId, string>;
    secPhilosophy: string;
    secWarmup: string;
    secStick: string;
    secConditioning: string;
    secTeam: string;
    secStructure: string;
    secPregame: string;
    secPosition: string;
    secWeekly: string;
    secStrength: string;
    secVideos: string;
    secHabits: string;
    rampNote: string;
    stickNote: string;
    videosNote: string;
    practice90: string;
    practice120: string;
    headDefault: [string, string, string];
    headPregame: [string, string, string];
    source: string;
  }
> = {
  ko: {
    back: "← 라크로스",
    nav: {
      philosophy: "철학",
      warmup: "웜업",
      stick: "스틱스킬",
      conditioning: "컨디셔닝",
      team: "팀 드릴",
      structure: "연습 구조",
      pregame: "경기 전",
      position: "포지션별",
      weekly: "주간",
      strength: "근력",
      videos: "영상",
      habits: "습관",
    },
    secPhilosophy: "1. 프로그램 철학",
    secWarmup: "2. 연습 웜업 (RAMP)",
    secStick: "3. 개인 스틱 스킬",
    secConditioning: "4. 컨디셔닝",
    secTeam: "5. 팀 드릴",
    secStructure: "6. 연습 시간 구조",
    secPregame: "7. 경기 전 웜업 (20분)",
    secPosition: "8. 포지션별 훈련 플랜",
    secWeekly: "9. 주간 로테이션",
    secStrength: "10. 근력 & 플라이오메트릭",
    secVideos: "11. 영상 자료실",
    secHabits: "12. 데일리 습관",
    rampNote: "Raise · Activate · Mobilize · Potentiate — 총 15~18분",
    stickNote: "엘리트는 세션당 500회 이상 월볼. 매일 20분이 개인 발전의 가장 강력한 도구입니다.",
    videosNote: "모든 링크는 남자 선수·D1 코치·PLL 프로 영상입니다. (YouTube에서 열립니다)",
    practice90: "90분 연습",
    practice120: "2시간 연습",
    headDefault: ["시각", "블록", "내용"],
    headPregame: ["시각", "단계", "내용"],
    source: "출처:",
  },
  en: {
    back: "← Lacrosse",
    nav: {
      philosophy: "Philosophy",
      warmup: "Warm-up",
      stick: "Stick skills",
      conditioning: "Conditioning",
      team: "Team drills",
      structure: "Practice structure",
      pregame: "Pregame",
      position: "By position",
      weekly: "Weekly",
      strength: "Strength",
      videos: "Videos",
      habits: "Habits",
    },
    secPhilosophy: "1. Program Philosophy",
    secWarmup: "2. Practice Warm-up (RAMP)",
    secStick: "3. Individual Stick Skills",
    secConditioning: "4. Conditioning",
    secTeam: "5. Team Drills",
    secStructure: "6. Practice Time Structure",
    secPregame: "7. Pregame Warm-up (20 min)",
    secPosition: "8. Position-Specific Training Plans",
    secWeekly: "9. Weekly Rotation",
    secStrength: "10. Strength & Plyometrics",
    secVideos: "11. Video Library",
    secHabits: "12. Daily Habits",
    rampNote: "Raise · Activate · Mobilize · Potentiate — 15-18 min total",
    stickNote: "Elite players hit 500+ wall-ball reps per session. Twenty minutes a day is the most powerful tool for individual growth.",
    videosNote: "All links are men's players, D1 coaches, and PLL pros. (Opens on YouTube)",
    practice90: "90-minute practice",
    practice120: "2-hour practice",
    headDefault: ["Time", "Block", "Details"],
    headPregame: ["Time", "Phase", "Details"],
    source: "Source:",
  },
  es: {
    back: "← Lacrosse",
    nav: {
      philosophy: "Filosofía",
      warmup: "Calentamiento",
      stick: "Manejo del stick",
      conditioning: "Acondicionamiento",
      team: "Ejercicios de equipo",
      structure: "Estructura",
      pregame: "Prepartido",
      position: "Por posición",
      weekly: "Semanal",
      strength: "Fuerza",
      videos: "Videos",
      habits: "Hábitos",
    },
    secPhilosophy: "1. Filosofía del programa",
    secWarmup: "2. Calentamiento de práctica (RAMP)",
    secStick: "3. Manejo individual del stick",
    secConditioning: "4. Acondicionamiento",
    secTeam: "5. Ejercicios de equipo",
    secStructure: "6. Estructura de la práctica",
    secPregame: "7. Calentamiento prepartido (20 min)",
    secPosition: "8. Planes de entrenamiento por posición",
    secWeekly: "9. Rotación semanal",
    secStrength: "10. Fuerza y pliometría",
    secVideos: "11. Videoteca",
    secHabits: "12. Hábitos diarios",
    rampNote: "Raise · Activate · Mobilize · Potentiate — 15-18 min en total",
    stickNote: "Los jugadores de élite hacen más de 500 repeticiones de wall ball por sesión. Veinte minutos al día es la herramienta más poderosa para tu progreso individual.",
    videosNote: "Todos los enlaces son de jugadores masculinos, entrenadores de D1 y profesionales de la PLL. (Se abren en YouTube)",
    practice90: "Práctica de 90 minutos",
    practice120: "Práctica de 2 horas",
    headDefault: ["Hora", "Bloque", "Contenido"],
    headPregame: ["Hora", "Fase", "Contenido"],
    source: "Fuente:",
  },
};

export default function LacrosseProgramView({ sportId, lang = "ko" }: { sportId: string; lang?: Lang }) {
  const s = L[lang];
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/sports/${sportId}`} className="text-sm text-slate-500 hover:text-slate-600">
        {s.back}
      </Link>

      <header className="mt-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
        <p className="text-sm text-white/80">🥍 {loc(LAX_META.season, lang)}</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{loc(LAX_META.title, lang)}</h1>
        <p className="mt-1 text-white/85">{loc(LAX_META.subtitle, lang)}</p>
      </header>

      {/* Jump nav */}
      <nav className="sticky top-14 z-10 -mx-4 mt-4 overflow-x-auto border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur">
        <div className="flex gap-1.5">
          {NAV_IDS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
            >
              {s.nav[id]}
            </a>
          ))}
        </div>
      </nav>

      {/* 1. Philosophy */}
      <Section id="philosophy" title={s.secPhilosophy}>
        <blockquote className="rounded-xl border-l-4 border-emerald-400 bg-emerald-50 px-4 py-3 text-sm italic text-emerald-900">
          “{loc(LAX_QUOTE.text, lang)}” <span className="not-italic text-emerald-700">— {loc(LAX_QUOTE.by, lang)}</span>
        </blockquote>
        <ItemList items={LAX_PRINCIPLES} lang={lang} className="mt-4" />
      </Section>

      {/* 2. Warm-up */}
      <Section id="warmup" title={s.secWarmup}>
        <p className="mb-4 text-sm text-slate-500">{s.rampNote}</p>
        <div className="space-y-4">
          {LAX_WARMUP.map((ph, phi) => (
            <div key={phi} className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{loc(ph.title, lang)}</h3>
                <span className="badge bg-emerald-50 text-emerald-700">{loc(ph.time, lang)}</span>
              </div>
              <ItemList items={ph.items} lang={lang} className="mt-3" />
              {ph.source && <p className="mt-3 text-xs text-slate-500">{s.source} {loc(ph.source, lang)}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* 3. Stick skills */}
      <Section id="stick" title={s.secStick}>
        <p className="mb-4 text-sm text-slate-500">{s.stickNote}</p>
        <div className="space-y-4">
          {LAX_STICK.map((g, gi) => (
            <div key={gi} className="card p-5">
              <h3 className="font-bold">{loc(g.group, lang)}</h3>
              <ItemList items={g.items} lang={lang} className="mt-3" />
              {g.source && <p className="mt-3 text-xs text-slate-500">{s.source} {loc(g.source, lang)}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Conditioning */}
      <Section id="conditioning" title={s.secConditioning}>
        <p className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">{loc(LAX_CONDITIONING_NOTE, lang)}</p>
        <div className="card p-5">
          <ItemList items={LAX_CONDITIONING} lang={lang} />
        </div>
      </Section>

      {/* 5. Team drills */}
      <Section id="team" title={s.secTeam}>
        <div className="grid gap-4 md:grid-cols-3">
          {LAX_TEAM.map((g, gi) => (
            <div key={gi} className="card p-5">
              <h3 className="mb-3 font-bold">{loc(g.group, lang)}</h3>
              <ItemList items={g.items} lang={lang} />
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Practice structures */}
      <Section id="structure" title={s.secStructure}>
        <div className="space-y-6">
          <PracticeTable title={s.practice90} rows={LAX_PRACTICE_90} lang={lang} head={s.headDefault} />
          <PracticeTable title={s.practice120} rows={LAX_PRACTICE_120} lang={lang} head={s.headDefault} />
        </div>
      </Section>

      {/* 7. Pregame */}
      <Section id="pregame" title={s.secPregame}>
        <p className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">{loc(LAX_PREGAME_NOTE, lang)}</p>
        <PracticeTable rows={LAX_PREGAME} lang={lang} head={s.headPregame} />
      </Section>

      {/* 8. Positions */}
      <Section id="position" title={s.secPosition}>
        <div className="grid gap-4 sm:grid-cols-2">
          {LAX_POSITIONS.map((p, pi) => (
            <div key={pi} className="card p-5">
              <h3 className="font-bold">
                {p.emoji} {loc(p.name, lang)}
              </h3>
              <ItemList items={p.blocks} lang={lang} className="mt-3" />
              {p.source && <p className="mt-3 text-xs text-slate-500">{s.source} {loc(p.source, lang)}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* 9. Weekly */}
      <Section id="weekly" title={s.secWeekly}>
        <div className="card divide-y divide-slate-100">
          {LAX_WEEKLY.map(([day, focus], wi) => (
            <div key={wi} className="flex gap-4 px-5 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {loc(day, lang)}
              </span>
              <p className="pt-0.5 text-sm text-slate-700">{loc(focus, lang)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 10. Strength */}
      <Section id="strength" title={s.secStrength}>
        <div className="space-y-4">
          {LAX_STRENGTH.map((g, gi) => (
            <div key={gi} className="card p-5">
              <h3 className="font-bold">{loc(g.group, lang)}</h3>
              <ItemList items={g.items} lang={lang} className="mt-3" />
            </div>
          ))}
        </div>
      </Section>

      {/* 11. Videos */}
      <Section id="videos" title={s.secVideos}>
        <p className="mb-4 text-sm text-slate-500">{s.videosNote}</p>
        <div className="space-y-5">
          {LAX_VIDEOS.map((g, gi) => (
            <div key={gi}>
              <h3 className="mb-2 text-sm font-semibold text-slate-500">{loc(g.group, lang)}</h3>
              <div className="card divide-y divide-slate-100">
                {g.videos.map((v) => (
                  <a
                    key={v.url}
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50"
                  >
                    <span className="mt-0.5 text-brand">▶</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-800">{v.title}</span>
                      <span className="block text-xs text-slate-500">{loc(v.note, lang)}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 12. Habits */}
      <Section id="habits" title={s.secHabits}>
        <div className="card p-5">
          <ItemList items={LAX_HABITS} lang={lang} />
        </div>
      </Section>
    </main>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-8 scroll-mt-28">
      <h2 className="mb-4 border-l-4 border-emerald-500 pl-3 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function ItemList({ items, lang, className = "" }: { items: NamedItem[]; lang: Lang; className?: string }) {
  return (
    <ul className={`space-y-2.5 ${className}`}>
      {items.map((it, i) => (
        <li key={i} className="text-sm">
          <span className="font-semibold text-slate-800">{loc(it.name, lang)}</span>
          <span className="text-slate-600"> — {loc(it.detail, lang)}</span>
        </li>
      ))}
    </ul>
  );
}

function PracticeTable({
  title,
  rows,
  lang,
  head,
}: {
  title?: string;
  rows: [Localized, Localized, Localized][];
  lang: Lang;
  head: [string, string, string] | string[];
}) {
  return (
    <div>
      {title && <h3 className="mb-2 font-bold">{title}</h3>}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
              <th className="px-4 py-2.5 font-medium">{head[0]}</th>
              <th className="px-4 py-2.5 font-medium">{head[1]}</th>
              <th className="px-4 py-2.5 font-medium">{head[2]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-slate-500">{loc(r[0], lang)}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">{loc(r[1], lang)}</td>
                <td className="px-4 py-2.5 text-slate-600">{loc(r[2], lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
