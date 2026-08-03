// First-run checklist.
//
// The signup wizard explains the app; this tracks whether any of it actually
// happened. A new account lands on a dashboard with nothing in it, and the
// gap between "signed up" and "got one thing out of it" is where people leave.
//
// Steps are derived from real data, never from a "seen it" flag, so they can't
// drift out of sync with reality — and the card removes itself the moment the
// last one is done rather than needing to be dismissed.
//
// Pure and DB-free so the completion rules can be unit-tested.

export type FirstRunStep = "logTraining" | "measure" | "connectCoach" | "connectAthlete" | "feedback";

export interface FirstRunSignals {
  hasTrainingSession: boolean;
  hasRecord: boolean;
  hasAcceptedLink: boolean;
  hasLeftFeedback: boolean;
}

export interface FirstRunItem {
  step: FirstRunStep;
  href: string;
  done: boolean;
}

export interface FirstRunState {
  items: FirstRunItem[];
  doneCount: number;
  /** False once everything is done — the card disappears on its own. */
  show: boolean;
}

const ATHLETE: { step: FirstRunStep; href: string; from: (s: FirstRunSignals) => boolean }[] = [
  { step: "logTraining", href: "/journal", from: (s) => s.hasTrainingSession },
  { step: "measure", href: "/sports/swimming", from: (s) => s.hasRecord },
  { step: "connectCoach", href: "/connections", from: (s) => s.hasAcceptedLink },
];

const COACH: { step: FirstRunStep; href: string; from: (s: FirstRunSignals) => boolean }[] = [
  { step: "connectAthlete", href: "/connections", from: (s) => s.hasAcceptedLink },
  { step: "feedback", href: "/coach", from: (s) => s.hasLeftFeedback },
  { step: "logTraining", href: "/journal", from: (s) => s.hasTrainingSession },
];

export function firstRunState(role: "ATHLETE" | "COACH", signals: FirstRunSignals): FirstRunState {
  const defs = role === "COACH" ? COACH : ATHLETE;
  const items = defs.map((d) => ({ step: d.step, href: d.href, done: d.from(signals) }));
  const doneCount = items.filter((i) => i.done).length;
  return { items, doneCount, show: doneCount < items.length };
}

/** The first thing still outstanding — what the card should push hardest. */
export function nextStep(state: FirstRunState): FirstRunItem | null {
  return state.items.find((i) => !i.done) ?? null;
}
