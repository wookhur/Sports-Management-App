import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { schoolYearLabel } from "@/lib/season";
import { tl } from "@/lib/teamLogText";

/** The current school year and the two before it, through ?year=. */
export default function YearChips({ basePath, year, currentYear, lang }: { basePath: string; year: number; currentYear: number; lang: Lang }) {
  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-500">{tl(lang).common.year}</span>
      {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
        <Link
          key={y}
          href={`${basePath}?year=${y}`}
          aria-current={y === year ? "true" : undefined}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${y === year ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
        >
          {schoolYearLabel(y)}
        </Link>
      ))}
    </div>
  );
}
