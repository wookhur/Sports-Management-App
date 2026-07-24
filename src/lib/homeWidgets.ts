// Canonical list of toggleable home-dashboard sections. The home page renders
// each section only when its key is NOT in the user's homeHidden array, and
// the settings UI + API validate against this same list.
export const HOME_WIDGETS = [
  "calendar",
  "score",
  "streak",
  "weekly",
  "tasks",
  "badges",
  "sports",
  "recent",
] as const;

export type HomeWidget = (typeof HOME_WIDGETS)[number];

export function isHomeWidget(v: string): v is HomeWidget {
  return (HOME_WIDGETS as readonly string[]).includes(v);
}
