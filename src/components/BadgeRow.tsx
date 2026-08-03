import type { Badge } from "@/lib/badges";

/**
 * Earned badges in colour, locked ones muted.
 *
 * "Locked" is carried by the greyed emoji, the muted surface and the state in
 * the accessible name — not by fading the text. Dimming the whole tile with
 * opacity dropped the label to roughly 3:1, which fails AA, and it left the
 * state invisible to a screen reader since colour was the only signal.
 */
export default function BadgeRow({ badges }: { badges: Badge[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {badges.map((b) => (
        <li
          key={b.id}
          className={`rounded-xl border px-3 py-3 text-center transition ${
            b.earned ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className={`text-2xl ${b.earned ? "" : "opacity-40 grayscale"}`} aria-hidden="true">
            {b.emoji}
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-700">
            {b.name}
            {!b.earned && <span className="ml-1 text-slate-500" aria-hidden="true">🔒</span>}
          </p>
          <p className="mt-0.5 text-[10px] leading-tight text-slate-600">{b.detail}</p>
        </li>
      ))}
    </ul>
  );
}
