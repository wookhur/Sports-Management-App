// Durations in the coach-provided program sheets are free text — "10min",
// "10 min", sometimes nothing at all. That is fine as a source format and no
// reason to print it raw, so it is parsed once here.

/** Minutes in a phase's duration string, or null if it isn't a plain figure. */
export function parseMinutes(time: string | null | undefined): number | null {
  if (!time) return null;
  const m = /(\d+)\s*m/i.exec(time);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export interface PhaseSpan {
  /** Minutes, when the sheet gave a readable figure. */
  minutes: number | null;
  /** Share of the session, 0–1. Zero when the session can't be totalled. */
  share: number;
}

/**
 * How a session's time divides between its phases.
 *
 * Proportions are only shown when *every* phase carries a duration — a bar
 * drawn from four of five phases would understate the ones it could read, and
 * a coach comparing blocks at a glance would be reading a lie.
 */
export function sessionSpans(times: Array<string | null | undefined>): {
  totalMinutes: number | null;
  spans: PhaseSpan[];
} {
  const mins = times.map(parseMinutes);
  const complete = mins.length > 0 && mins.every((m) => m != null);
  const total = complete ? (mins as number[]).reduce((a, b) => a + b, 0) : null;
  return {
    totalMinutes: total,
    spans: mins.map((m) => ({
      minutes: m,
      share: total && m ? m / total : 0,
    })),
  };
}
