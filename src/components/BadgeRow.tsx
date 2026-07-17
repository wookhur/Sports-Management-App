import type { Badge } from "@/lib/badges";

// Earned badges in full color; locked ones grayed out with the unlock hint.
export default function BadgeRow({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {badges.map((b) => (
        <div
          key={b.id}
          title={b.detail}
          className={`rounded-xl border px-3 py-3 text-center transition ${
            b.earned ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50 opacity-50 grayscale"
          }`}
        >
          <div className="text-2xl" aria-hidden="true">{b.emoji}</div>
          <p className="mt-1 text-xs font-semibold text-slate-700">{b.name}</p>
          <p className="mt-0.5 text-[10px] leading-tight text-slate-400">{b.detail}</p>
        </div>
      ))}
    </div>
  );
}
