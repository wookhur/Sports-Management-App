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
