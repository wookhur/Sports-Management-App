import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import {
  filterWorkouts,
  getWorkoutCount,
  getVideoCount,
  STROKES,
  BASES,
  LEVELS,
  STROKE_KO,
  LEVEL_KO,
} from "@/lib/swimming";

const PAGE_SIZE = 24;

const levelBadge: Record<string, string> = {
  Beginner: "bg-emerald-50 text-emerald-600",
  Intermediate: "bg-amber-50 text-amber-600",
  Advanced: "bg-rose-50 text-rose-600",
};

type SP = { stroke?: string; base?: string; level?: string; page?: string };

function buildQuery(base: SP, patch: Partial<SP>): string {
  const merged = { ...base, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export default async function SwimWorkoutsPage({
  params,
  searchParams,
}: {
  params: Promise<{ sportId: string }>;
  searchParams: Promise<SP>;
}) {
  if (!(await getSession())) redirect("/login");
  const { sportId } = await params;
  // The workout database is swimming-only.
  if (sportId !== "swimming") notFound();
  const sp = await searchParams;
  const basePath = `/sports/${sportId}/workouts`;

  const stroke = STROKES.includes(sp.stroke as (typeof STROKES)[number]) ? sp.stroke : undefined;
  const base = sp.base && BASES.includes(Number(sp.base) as (typeof BASES)[number]) ? Number(sp.base) : undefined;
  const level = LEVELS.includes(sp.level as (typeof LEVELS)[number]) ? sp.level : undefined;
  const activeSP: SP = { stroke, base: base ? String(base) : undefined, level };

  const results = filterWorkouts({ stroke, base, level });
  const page = Math.max(1, Number(sp.page) || 1);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageRows = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link href={`/sports/${sportId}`} className="text-sm text-slate-400 hover:text-slate-600">
          ← 수영
        </Link>

        <header className="mt-3">
          <h1 className="text-2xl font-bold">🏊 수영 훈련 프로그램</h1>
          <p className="mt-1 text-slate-500">
            총 {getWorkoutCount().toLocaleString()}개 워크아웃 · {getVideoCount()}개 검증 드릴 영상. 영법·거리·레벨로 골라보세요.
          </p>
        </header>

        {/* Filters */}
        <div className="mt-6 space-y-3">
          <FilterRow
            label="영법"
            basePath={basePath}
            options={STROKES.map((s) => ({ value: s, label: STROKE_KO[s] }))}
            active={stroke}
            activeSP={activeSP}
            param="stroke"
          />
          <FilterRow
            label="거리"
            basePath={basePath}
            options={BASES.map((b) => ({ value: String(b), label: `${b}m` }))}
            active={base ? String(base) : undefined}
            activeSP={activeSP}
            param="base"
          />
          <FilterRow
            label="레벨"
            basePath={basePath}
            options={LEVELS.map((l) => ({ value: l, label: LEVEL_KO[l] }))}
            active={level}
            activeSP={activeSP}
            param="level"
          />
        </div>

        <p className="mt-6 text-sm text-slate-500">
          <span className="font-semibold text-slate-800">{results.length.toLocaleString()}</span>개 결과
          {totalPages > 1 && ` · ${current}/${totalPages} 페이지`}
        </p>

        {/* Results */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pageRows.map((w) => (
            <Link
              key={w.id}
              href={`${basePath}/${w.id}`}
              className="card group p-4 transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">{w.id}</span>
                <span className={`badge ${levelBadge[w.level]}`}>{LEVEL_KO[w.level]}</span>
              </div>
              <p className="mt-2 font-bold group-hover:text-brand">
                {STROKE_KO[w.stroke]} · {w.base}m 기준
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                <span>총 {w.totalDistanceM.toLocaleString()}m</span>
                <span>·</span>
                <span>{w.targetTime}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {current > 1 && (
              <Link href={`${basePath}${buildQuery(activeSP, { page: String(current - 1) })}`} className="btn-ghost">
                ← 이전
              </Link>
            )}
            <span className="px-3 text-sm text-slate-500">
              {current} / {totalPages}
            </span>
            {current < totalPages && (
              <Link href={`${basePath}${buildQuery(activeSP, { page: String(current + 1) })}`} className="btn-ghost">
                다음 →
              </Link>
            )}
          </div>
        )}
      </main>
    </>
  );
}

function FilterRow({
  label,
  basePath,
  options,
  active,
  activeSP,
  param,
}: {
  label: string;
  basePath: string;
  options: { value: string; label: string }[];
  active?: string;
  activeSP: SP;
  param: keyof SP;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-10 shrink-0 text-sm font-medium text-slate-400">{label}</span>
      <Chip href={`${basePath}${buildQuery(activeSP, { [param]: undefined, page: undefined })}`} on={!active}>
        전체
      </Chip>
      {options.map((o) => (
        <Chip
          key={o.value}
          href={`${basePath}${buildQuery(activeSP, { [param]: o.value, page: undefined })}`}
          on={active === o.value}
        >
          {o.label}
        </Chip>
      ))}
    </div>
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
