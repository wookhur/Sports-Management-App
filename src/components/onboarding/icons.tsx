// Hand-authored icon set for the Roy onboarding wizard — one consistent
// visual language (24x24, 1.5px stroke, round caps/joins) instead of emoji,
// per ui-ux-pro-max's "no emoji as structural icons" / stroke-consistency rules.

type IconProps = { className?: string };
const base = "stroke-current fill-none";
const strokeProps = { strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M5 13l4 4 10-10" />
    </svg>
  );
}

export function ShuffleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M4 7h3.5c2 0 3 1 4 2.5M4 17h3.5c2 0 3-1 4-2.5M14 7h6m0 0l-2.5-2.5M20 7l-2.5 2.5M14 17h6m0 0l-2.5 2.5M20 17l-2.5-2.5" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.7C10.9 5.6 11.4 5.5 12 5.5c6 0 9.5 6.5 9.5 6.5a15.6 15.6 0 0 1-3 3.8M6.2 7.3A15.7 15.7 0 0 0 2.5 12S6 18.5 12 18.5c1.2 0 2.3-.2 3.3-.6" />
      <path d="M9.6 10c-.4.5-.6 1.2-.6 2 0 1.7 1.3 3 3 3 .7 0 1.4-.2 1.9-.6" />
    </svg>
  );
}

export function RunnerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <circle cx="14.5" cy="4.5" r="1.6" strokeWidth={1.4} />
      <path d="M9 21l2.5-5 2-2-1-4-3.5 1.5L7 14M13.5 10l2 2.5 3.5 1M11.5 14L14 12" />
    </svg>
  );
}

export function ClipboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <rect x="5.5" y="4.5" width="13" height="16" rx="2" />
      <rect x="9" y="3" width="6" height="3" rx="1" />
      <path d="M8.5 12h7M8.5 15.5h5" />
    </svg>
  );
}

export function LacrosseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M5 19L17 4" />
      <ellipse cx="18.3" cy="3.3" rx="2.4" ry="1.7" transform="rotate(40 18.3 3.3)" />
      <path d="M17 6.3l1.6-2" />
    </svg>
  );
}

export function SoccerBallIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8.3l3.4 2.5-1.3 4h-4.2l-1.3-4L12 8.3ZM12 8.3V5.2M15.4 10.8l2.9-1M8.6 10.8l-2.9-1M9.9 14.8l-1.7 2.7M14.1 14.8l1.7 2.7" />
    </svg>
  );
}

export function SwimIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <circle cx="17.5" cy="5.5" r="1.7" strokeWidth={1.4} />
      <path d="M3 12.5l3-2.5 3 2 3.5-3 3 2.5 3-1.5" />
      <path d="M3 17c1.2 1 2.4 1 3.6 0s2.4-1 3.6 0 2.4 1 3.6 0 2.4-1 3.6 0 2.4 1 3.6 0" />
    </svg>
  );
}
