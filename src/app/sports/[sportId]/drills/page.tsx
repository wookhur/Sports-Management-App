import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import DrillDiagram from "@/components/DrillDiagram";
import { AGE_LEVELS, drillsForAge } from "@/lib/soccerDrills";

type SP = { age?: string };

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
  const { age } = await searchParams;
  const activeAge = AGE_LEVELS.some((a) => a.key === age) ? age : undefined;
  const drills = drillsForAge(activeAge);
  const basePath = `/sports/${sportId}/drills`;

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link href={`/sports/${sportId}`} className="text-sm text-slate-400 hover:text-slate-600">
          ← 축구
        </Link>

        <header className="mt-3">
          <h1 className="text-2xl font-bold">⚽ 축구 드릴</h1>
          <p className="mt-1 text-slate-500">연령대를 선택하면 그에 맞는 드릴을 그림과 함께 볼 수 있어요.</p>
        </header>

        {/* Age filter */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Chip href={basePath} on={!activeAge}>
            전체
          </Chip>
          {AGE_LEVELS.map((a) => (
            <Chip key={a.key} href={`${basePath}?age=${a.key}`} on={activeAge === a.key}>
              {a.label}
              <span className="ml-1 text-xs opacity-70">· {a.note}</span>
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
                <DrillDiagram spec={d.diagram} />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="badge bg-indigo-50 text-indigo-600">{d.category}</span>
                  <span className="text-xs text-slate-400">⏱ {d.durationMin}분</span>
                </div>
                <h3 className="mt-2 font-bold group-hover:text-brand">{d.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{d.summary}</p>
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
