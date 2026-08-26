// Sport identity marks.
//
// These started life inside the sign-up wizard, but a sport's mark shows up in
// the sidebar, the leaderboard filters, journal entries, record cards and every
// sport page heading — so it lives here, and the wizard imports it like anyone
// else. Same drawing rules as the rest of the icon set: 24x24 box, 1.6px
// stroke, round caps and joins, colour inherited from the parent.

import type { ReactElement } from "react";

type IconProps = { className?: string };
const base = "stroke-current fill-none";
const strokeProps = {
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function RunnerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <circle cx="14.5" cy="4.5" r="1.6" strokeWidth={1.4} />
      <path d="M9 21l2.5-5 2-2-1-4-3.5 1.5L7 14M13.5 10l2 2.5 3.5 1M11.5 14L14 12" />
    </svg>
  );
}

export function LacrosseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M5 19L17 4" />
      <ellipse cx="18.3" cy="3.3" rx="2.4" ry="1.7" transform="rotate(40 18.3 3.3)" />
      <path d="M17 6.3l1.6-2" />
    </svg>
  );
}

export function SoccerBallIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8.3l3.4 2.5-1.3 4h-4.2l-1.3-4L12 8.3ZM12 8.3V5.2M15.4 10.8l2.9-1M8.6 10.8l-2.9-1M9.9 14.8l-1.7 2.7M14.1 14.8l1.7 2.7" />
    </svg>
  );
}

export function SwimIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <circle cx="17.5" cy="5.5" r="1.7" strokeWidth={1.4} />
      <path d="M3 12.5l3-2.5 3 2 3.5-3 3 2.5 3-1.5" />
      <path d="M3 17c1.2 1 2.4 1 3.6 0s2.4-1 3.6 0 2.4 1 3.6 0 2.4-1 3.6 0 2.4 1 3.6 0" />
    </svg>
  );
}

export function BasketballIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17M3.5 12h17" />
      <path d="M6 6a9 9 0 0 1 0 12M18 6a9 9 0 0 0 0 12" />
    </svg>
  );
}

const BY_SPORT: Record<string, (props: IconProps) => ReactElement> = {
  lacrosse: LacrosseIcon,
  soccer: SoccerBallIcon,
  swimming: SwimIcon,
  basketball: BasketballIcon,
  track: RunnerIcon,
};

/** The mark for a sport. Unknown ids fall back to the runner. */
export function sportIcon(sportId: string) {
  return BY_SPORT[sportId] ?? RunnerIcon;
}

/**
 * Convenience wrapper for the common case — render the mark for a sport id.
 * Decorative: the sport's name is always next to it in readable text, so this
 * is hidden from screen readers.
 */
export default function SportIcon({
  sportId,
  className,
}: {
  sportId: string;
  className?: string;
}) {
  const Icon = sportIcon(sportId);
  return <Icon className={className} />;
}
