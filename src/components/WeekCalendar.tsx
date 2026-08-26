import { t, type Lang } from "@/lib/i18n";

export interface WeekDay {
  key: string;
  dayNum: number;
  isToday: boolean;
  hasActivity: boolean;
}

/** The home week strip (Mon→Sun). Days with a logged record show an activity
 *  dot; today is highlighted. Presentational — data is computed on the server. */
export default function WeekCalendar({ lang, days }: { lang: Lang; days: WeekDay[] }) {
  const s = t(lang).calendar;
  const activeCount = days.filter((d) => d.hasActivity).length;

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-5 text-white shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">{s.activity}</p>
        <p className="text-xs text-white/70">
          {activeCount}/7 · {s.activity}
        </p>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div key={d.key} className="flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-medium text-white/70">{s.weekdays[i]}</span>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold tabular-nums transition ${
                d.isToday ? "bg-white text-brand" : "text-white"
              }`}
            >
              {d.dayNum}
            </span>
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${
                d.hasActivity ? "bg-white" : "bg-white/20"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
