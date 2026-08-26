import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { TimerIcon } from "@/components/navIcons";
import NavBar from "@/components/NavBar";
import DrillDiagram from "@/components/DrillDiagram";
import { getLang } from "@/lib/getLang";
import type { Lang } from "@/lib/i18n";
import { AGE_LEVELS, drillsForAge } from "@/lib/soccerDrills";
import { L as loc } from "@/lib/localized";

type SP = { age?: string };

const L: Record<
  Lang,
  {
    back: string;
    title: string;
    subtitle: string;
    all: string;
    minutes: (n: number) => string;
  }
> = {
  ko: {
    back: "← 축구",
    title: "축구 드릴",
    subtitle: "연령대를 선택하면 그에 맞는 드릴을 그림과 함께 볼 수 있어요.",
    all: "전체",
    minutes: (n) => `${n}분`,
  },
  en: {
    back: "← Soccer",
    title: "Soccer Drills",
    subtitle: "Pick an age group to see matching drills with diagrams.",
    all: "All",
    minutes: (n) => `${n} min`,
  },
  es: {
    back: "← Fútbol",
    title: "Ejercicios de fútbol",
    subtitle: "Elige un grupo de edad para ver los ejercicios adecuados con diagramas.",
    all: "Todos",
    minutes: (n) => `${n} min`,
  },
};

export default async function DrillsPage({
  params,
  searchParams,
}: {
  params: Promise<{ sportId: string }>;
  searchParams: Promise<SP>;
}) {
  if (!(await getSession())) redirect("/login");
  const { sportId } = await params;
  if (sportId !== "soccer") notFound();
  const lang = await getLang();
  const s = L[lang];
  const { age } = await searchParams;
  const activeAge = AGE_LEVELS.some((a) => a.key === age) ? age : undefined;
  const drills = drillsForAge(activeAge);
  const basePath = `/sports/${sportId}/drills`;

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link href={`/sports/${sportId}`} className="text-sm text-slate-500 hover:text-slate-600">
          {s.back}
        </Link>

        <header className="mt-3">
          <h1 className="text-2xl font-bold">{s.title}</h1>
          <p className="mt-1 text-slate-500">{s.subtitle}</p>
        </header>

        {/* Age filter */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Chip href={basePath} on={!activeAge}>
            {s.all}
          </Chip>
          {AGE_LEVELS.map((a) => (
            <Chip key={a.key} href={`${basePath}?age=${a.key}`} on={activeAge === a.key}>
              {loc(a.label, lang)}
              <span className="ml-1 text-xs opacity-70">· {loc(a.note, lang)}</span>
            </Chip>
          ))}
        </div>

        {/* Drill cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {drills.map((d) => (
            <Link
              key={d.id}
              href={`${basePath}/${d.id}${activeAge ? `?age=${activeAge}` : ""}`}
              className="card group overflow-hidden transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="bg-slate-900 p-2">
                <DrillDiagram spec={d.diagram} lang={lang} />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="badge bg-indigo-50 text-indigo-600">{loc(d.category, lang)}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <TimerIcon className="h-3.5 w-3.5" />
                    {s.minutes(d.durationMin)}
                  </span>
                </div>
                <h3 className="mt-2 font-bold group-hover:text-brand">{loc(d.title, lang)}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{loc(d.summary, lang)}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

function Chip({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        on ? "border-brand bg-brand text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      {children}
    </Link>
  );
}
