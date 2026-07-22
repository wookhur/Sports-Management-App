// Shared formatting helpers.

/** ms -> "m:ss.SS" (or "ss.SS" under a minute). */
export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalCentis = Math.round(ms / 10);
  const centis = totalCentis % 100;
  const totalSeconds = Math.floor(totalCentis / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  const cs = centis.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");
  if (minutes > 0) return `${minutes}:${ss}.${cs}`;
  return `${seconds}.${cs}`;
}

/** meters + ms -> pace per 100m as "m:ss". */
export function formatPace(distanceM: number, ms: number): string | null {
  if (!distanceM || !ms) return null;
  const per100 = (ms / distanceM) * 100;
  const totalSeconds = Math.round(per100 / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}/100m`;
}

const DATE_LOCALE: Record<string, string> = { ko: "ko-KR", en: "en-US", es: "es-ES" };

export function formatDate(input: Date | string, lang: string = "ko"): string {
  const d = typeof input === "string" ? new Date(input) : input;
  // Dates are stored in UTC; the serverless runtime's local timezone isn't
  // guaranteed to be Korea, so pin display explicitly to KST.
  return new Intl.DateTimeFormat(DATE_LOCALE[lang] ?? "ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** "YYYY-MM-DD" for a date as seen in Asia/Seoul. Used as the daily-reset key
 *  for missions and the week-calendar day cells. */
export function seoulDayKey(input: Date | string = new Date()): string {
  const d = typeof input === "string" ? new Date(input) : input;
  // en-CA formats as YYYY-MM-DD, which is exactly the key shape we want.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "numeric",
  }).format(d);
}

/** The current week (Mon→Sun) as seen in Asia/Seoul, plus today's key.
 *  Used to render the home week-calendar strip. */
export function weekInSeoul(): { days: { key: string; dayNum: number }[]; todayKey: string } {
  const todayKey = seoulDayKey();
  const [y, m, d] = todayKey.split("-").map(Number);
  // Anchor at noon UTC of the Seoul calendar date so weekday math is stable.
  const base = new Date(Date.UTC(y, m - 1, d, 12));
  const dow = base.getUTCDay(); // 0 Sun … 6 Sat
  const mondayOffset = (dow + 6) % 7; // days since Monday
  const monday = new Date(base);
  monday.setUTCDate(base.getUTCDate() - mondayOffset);

  const days: { key: string; dayNum: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(monday);
    dt.setUTCDate(monday.getUTCDate() + i);
    const key = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
    days.push({ key, dayNum: dt.getUTCDate() });
  }
  return { days, todayKey };
}

const REL_UNITS: Record<string, { justNow: string; min: (n: number) => string; hour: (n: number) => string; day: (n: number) => string }> = {
  ko: {
    justNow: "방금 전",
    min: (n) => `${n}분 전`,
    hour: (n) => `${n}시간 전`,
    day: (n) => `${n}일 전`,
  },
  en: {
    justNow: "just now",
    min: (n) => `${n} min ago`,
    hour: (n) => `${n} hr ago`,
    day: (n) => `${n} day${n === 1 ? "" : "s"} ago`,
  },
  es: {
    justNow: "ahora mismo",
    min: (n) => `hace ${n} min`,
    hour: (n) => `hace ${n} h`,
    day: (n) => `hace ${n} día${n === 1 ? "" : "s"}`,
  },
};

/** Relative time like "43분 전". Falls back to an absolute date past a week. */
export function formatRelative(input: Date | string, lang: string = "ko"): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const u = REL_UNITS[lang] ?? REL_UNITS.ko;
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return u.justNow;
  if (mins < 60) return u.min(mins);
  const hours = Math.floor(mins / 60);
  if (hours < 24) return u.hour(hours);
  const days = Math.floor(hours / 24);
  if (days < 7) return u.day(days);
  return formatDate(d, lang);
}
