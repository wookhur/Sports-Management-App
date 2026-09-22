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
import { visibleDrills } from "@/lib/customDrills";
import DrillUpload from "@/components/DrillUpload";

type SP = { age?: string };

const L: Record<
  Lang,
  {
    back: string;
    title: string;
    subtitle: string;
    all: string;
    minutes: (n: number) => string;
    mine: string;
    mineSub: string;
    mineEmpty: string;
    library: string;
    by: (name: string) => string;
  }
> = {
  ko: {
    back: "← 축구",
    title: "축구 드릴",
    subtitle: "연령대를 선택하면 그에 맞는 드릴을 그림과 함께 볼 수 있어요.",
    all: "전체",
    minutes: (n) => `${n}분`,
    mine: "우리 팀 드릴",
    mineSub: "직접 그려서 올린 드릴. 코치와 팀원에게만 보여요.",
    mineEmpty: "아직 올린 드릴이 없어요. SoccerDrive에서 그린 드릴을 PDF나 PNG로 올려보세요.",
    library: "드릴 라이브러리",
    by: (name) => `${name} 올림`,
  },
  en: {
    back: "← Soccer",
    title: "Soccer Drills",
    subtitle: "Pick an age group to see matching drills with diagrams.",
    all: "All",
    minutes: (n) => `${n} min`,
    mine: "Our team's drills",
    mineSub: "Drills you drew and uploaded. Only your coach and teammates see them.",
    mineEmpty: "No uploaded drills yet. Draw one on SoccerDrive and upload the PDF or PNG.",
    library: "Drill library",
    by: (name) => `by ${name}`,
  },
  es: {
    back: "← Fútbol",
    title: "Ejercicios de fútbol",
    subtitle: "Elige un grupo de edad para ver los ejercicios adecuados con diagramas.",
    all: "Todos",
    minutes: (n) => `${n} min`,
    mine: "Ejercicios de nuestro equipo",
    mineSub: "Ejercicios que dibujaste y subiste. Solo los ven tu entrenador y tus compañeros.",
    mineEmpty: "Todavía no hay ejercicios subidos. Dibuja uno en SoccerDrive y sube el PDF o el PNG.",
    library: "Biblioteca de ejercicios",
    by: (name) => `de ${name}`,
  },
};

export default async function DrillsPage({
  params,
  searchParams,
}: {
  params: Promise<{ sportId: string }>;
  searchParams: Promise<SP>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { sportId } = await params;
  if (sportId !== "soccer") notFound();
  const lang = await getLang();
  const s = L[lang];
  const { age } = await searchParams;
  const activeAge = AGE_LEVELS.some((a) => a.key === age) ? age : undefined;
  const drills = drillsForAge(activeAge);
  const basePath = `/sports/${sportId}/drills`;
  // A custom drill with no age tags belongs to every age view; one that is
  // tagged only shows up under its own tags, like the library drills do.
  const custom = (await visibleDrills(session.userId, sportId)).filter(
    (d) => !activeAge || d.ageLevels.length === 0 || d.ageLevels.includes(activeAge),
  );

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
            <Chip key={a.key} href={`${basePath}?age=${encodeURIComponent(a.key)}`} on={activeAge === a.key}>
              {loc(a.label, lang)}
              <span className="ml-1 text-xs font-normal">· {loc(a.note, lang)}</span>
            </Chip>
          ))}
        </div>

        {/* Drills the team drew themselves */}
        <section className="mt-8" aria-labelledby="custom-drills-heading">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="custom-drills-heading" className="text-lg font-bold">
                {s.mine}
              </h2>
              <p className="text-sm text-slate-600">{s.mineSub}</p>
            </div>
            <DrillUpload sportId={sportId} lang={lang} />
          </div>
          {custom.length === 0 ? (
            <p className="card px-5 py-4 text-sm text-slate-600">{s.mineEmpty}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {custom.map((d) => (
                <Link
                  key={d.id}
                  href={`${basePath}/${d.id}`}
                  className="card group overflow-hidden transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className="aspect-[8/5] bg-white">
                    {/* Served from our own API; nothing for next/image to optimise. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/drills/${d.id}/image`} alt="" className="h-full w-full object-contain" loading="lazy" />
                  </div>
                  <div className="border-t border-slate-100 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge bg-emerald-50 text-emerald-700">{s.by(d.ownerName)}</span>
                      {d.durationMin !== null && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <TimerIcon className="h-3.5 w-3.5" />
                          {s.minutes(d.durationMin)}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-bold group-hover:text-brand">{d.title}</h3>
                    {d.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{d.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <h2 className="mt-10 text-lg font-bold">{s.library}</h2>
        {/* Drill cards */}
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {drills.map((d) => (
            <Link
              key={d.id}
              href={`${basePath}/${d.id}${activeAge ? `?age=${encodeURIComponent(activeAge)}` : ""}`}
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
