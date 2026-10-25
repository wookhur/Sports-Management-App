import type { Lang } from "@/lib/i18n";
import { tl } from "@/lib/teamLogText";
import type { TeamRecord } from "@/lib/matchStats";

function RecordRow({ label, r }: { label: string; r: TeamRecord }) {
  return (
    <tr>
      <th scope="row" className="px-4 py-2 text-left font-medium">
        {label}
      </th>
      {[r.played, r.won, r.drawn, r.lost, r.goalsFor, r.goalsAgainst].map((v, i) => (
        <td key={i} className="px-2 py-2 text-center tabular-nums">
          {v}
        </td>
      ))}
      <td className={`px-3 py-2 text-center font-semibold tabular-nums ${r.diff > 0 ? "text-emerald-700" : r.diff < 0 ? "text-rose-700" : ""}`}>
        {r.diff > 0 ? `+${r.diff}` : r.diff}
      </td>
    </tr>
  );
}

export default function RecordTable({ lang, rows }: { lang: Lang; rows: { label: string; r: TeamRecord }[] }) {
  const m = tl(lang).matches;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-100 text-xs text-slate-500">
          <th />
          {[m.pj, m.pg, m.pe, m.pp, m.gf, m.gc, m.dif].map((h) => (
            <th key={h} className="px-2 py-2 text-center font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row) => (
          <RecordRow key={row.label} {...row} />
        ))}
      </tbody>
    </table>
  );
}

