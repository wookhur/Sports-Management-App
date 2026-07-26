import Link from "next/link";
import PetAvatar from "./PetAvatar";
import { petState, HATCH, type PetMood } from "@/lib/pet";
import { t, type Lang } from "@/lib/i18n";

/** The app-wide companion greeting: the pet reacts to the athlete's real
 *  training state and speaks, then points at whatever it needs next. */
export default function CompanionCard({
  lang,
  name,
  growth,
  mood,
  streak,
  daysIdle,
  needsCare,
  sayOverride,
}: {
  lang: Lang;
  name: string;
  growth: number;
  mood: PetMood;
  streak: number;
  daysIdle: number;
  /** true when beans are on hand for an affordable care action */
  needsCare: boolean;
  /** milestone/greeting line to speak instead of the mood line */
  sayOverride?: string | null;
}) {
  const c = t(lang).companion;
  const st = petState(growth);
  const arg = mood === "proud" ? streak : mood === "sleepy" ? daysIdle : 0;
  const line = sayOverride ?? (c.say[mood] ?? c.say.waiting)(name, arg);
  const pct = st.stage === "egg" ? st.hatchPct : st.toNext == null ? 1 : st.into / st.span;

  return (
    <Link
      href="/missions"
      className="flex items-center gap-4 rounded-2xl border border-brand/15 bg-gradient-to-r from-sky-50 to-indigo-50 p-4 transition hover:border-brand/30 hover:shadow-md"
    >
      <div className="relative shrink-0">
        <PetAvatar growth={growth} className="h-20 w-20" />
        {needsCare && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white shadow">
            !
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {/* Speech bubble */}
        <div className="relative inline-block max-w-full rounded-2xl rounded-bl-sm bg-white px-3.5 py-2 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">{line}</p>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-bold text-slate-500">
            {st.label[lang]}
          </span>
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/70">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.round(pct * 100)}%` }} />
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-brand">
            {needsCare ? c.careCta : c.visitCta} →
          </span>
        </div>
        {st.stage === "egg" && (
          <p className="mt-1 text-[11px] text-slate-400">
            {c.hatchIn(Math.max(0, HATCH - growth))}
          </p>
        )}
      </div>
    </Link>
  );
}
