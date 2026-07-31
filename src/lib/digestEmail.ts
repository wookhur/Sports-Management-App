// Rendering the weekly digest as an email.
//
// Email is not the web. Mail clients strip <style> blocks, ignore flexbox and
// grid, and Outlook still renders through Word, so everything here is tables
// with inline styles and no external assets. Ugly to write, but it survives.
//
// Pure string building, no DB and no network, so the output can be asserted in
// tests rather than eyeballed in a client.

import type { Digest } from "./digest";
import { t, metricLabel, type Lang } from "./i18n";
import { formatDayKey, formatDuration } from "./format";

const BRAND = "#0f766e";
const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";

/** Flag colours mirror the dashboard so the two read as one product. */
const FLAG_COLOR: Record<string, string> = {
  injuryRisk: "#dc2626",
  disengaged: "#ea580c",
  plateau: "#ca8a04",
  breakthrough: "#059669",
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function reasonFor(item: Digest["attention"][number], s: ReturnType<typeof t>["triage"]): string {
  switch (item.flag) {
    case "injuryRisk":
      return s.reason.injuryRisk(item.value);
    case "disengaged":
      return s.reason.disengaged(item.value);
    case "plateau":
      return s.reason.plateau(item.value ?? 0, item.sessions14);
    default:
      return s.reason.breakthrough(item.value ?? 0);
  }
}

function deltaLine(d: Digest, s: ReturnType<typeof t>["digest"]): string {
  if (d.sessionsDelta > 0) return s.deltaUp(d.sessionsDelta);
  if (d.sessionsDelta < 0) return s.deltaDown(Math.abs(d.sessionsDelta));
  return s.deltaFlat;
}

export function digestSubject(d: Digest, lang: Lang): string {
  const s = t(lang).digest;
  return s.subject(formatDayKey(d.weekFrom, lang), formatDayKey(d.weekTo, lang));
}

/** Plain-text alternative. Some clients show it, and spam filters expect it. */
export function digestText(d: Digest, lang: Lang, appUrl: string): string {
  const s = t(lang).digest;
  const tri = t(lang).triage;
  const from = formatDayKey(d.weekFrom, lang);
  const to = formatDayKey(d.weekTo, lang);

  const lines = [
    s.greeting(d.coachName),
    "",
    s.intro(from, to),
    "",
    `${s.statActive}: ${d.activeAthletes}/${d.squadSize}`,
    `${s.statSessions}: ${d.sessions} (${deltaLine(d, s)})`,
    `${s.statHours}: ${(d.minutes / 60).toFixed(1)}`,
    "",
    `## ${s.attentionHeading}`,
  ];

  if (d.attention.length === 0) {
    lines.push(s.attentionEmpty);
  } else {
    for (const a of d.attention) {
      lines.push(`- ${a.name} (${tri.label[a.flag]}) — ${reasonFor(a, tri)} → ${tri.action[a.flag]}`);
    }
    if (d.attentionOverflow > 0) lines.push(s.attentionMore(d.attentionOverflow));
  }

  lines.push("", `## ${s.highlightsHeading}`);
  if (d.highlights.length === 0) {
    lines.push(s.highlightsEmpty);
  } else {
    for (const h of d.highlights) {
      lines.push(`- ${h.name} — ${metricLabel(h.metricKey, h.metricName, lang)} ${formatDuration(h.durationMs)}`);
    }
    if (d.highlightsOverflow > 0) lines.push(s.highlightsMore(d.highlightsOverflow));
  }

  lines.push("", `${s.cta}: ${appUrl}/coach`, "", s.footer, s.unsubscribe);
  return lines.join("\n");
}

function statCell(label: string, value: string, hint?: string): string {
  return `<td style="padding:0 8px 0 0;vertical-align:top;">
    <div style="border:1px solid ${LINE};border-radius:10px;padding:12px 14px;">
      <div style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:.04em;">${esc(label)}</div>
      <div style="font-size:22px;font-weight:700;color:${INK};padding-top:2px;">${esc(value)}</div>
      ${hint ? `<div style="font-size:11px;color:${MUTED};">${esc(hint)}</div>` : ""}
    </div>
  </td>`;
}

export function digestHtml(d: Digest, lang: Lang, appUrl: string): string {
  const s = t(lang).digest;
  const tri = t(lang).triage;
  const from = formatDayKey(d.weekFrom, lang);
  const to = formatDayKey(d.weekTo, lang);

  const attention =
    d.attention.length === 0
      ? `<p style="margin:0;font-size:14px;color:${MUTED};">${esc(s.attentionEmpty)}</p>`
      : d.attention
          .map(
            (a) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
    <tr><td style="border-left:3px solid ${FLAG_COLOR[a.flag] ?? MUTED};padding:8px 0 8px 12px;">
      <div style="font-size:14px;font-weight:700;color:${INK};">
        ${esc(a.name)}
        <span style="font-weight:600;font-size:11px;color:${FLAG_COLOR[a.flag] ?? MUTED};">· ${esc(tri.label[a.flag])}</span>
      </div>
      <div style="font-size:13px;color:#334155;padding-top:2px;">${esc(reasonFor(a, tri))}</div>
      <div style="font-size:12px;color:${MUTED};padding-top:2px;">→ ${esc(tri.action[a.flag])}</div>
    </td></tr></table>`,
          )
          .join("") +
        (d.attentionOverflow > 0
          ? `<p style="margin:6px 0 0;font-size:12px;color:${MUTED};">${esc(s.attentionMore(d.attentionOverflow))}</p>`
          : "");

  const highlights =
    d.highlights.length === 0
      ? `<p style="margin:0;font-size:14px;color:${MUTED};">${esc(s.highlightsEmpty)}</p>`
      : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${d.highlights
          .map(
            (h) => `<tr>
      <td style="padding:6px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK};">
        <strong>${esc(h.name)}</strong>
        <span style="color:${MUTED};">${esc(metricLabel(h.metricKey, h.metricName, lang))}</span>
      </td>
      <td style="padding:6px 0;border-bottom:1px solid ${LINE};text-align:right;font-size:14px;font-weight:700;color:${INK};white-space:nowrap;">
        ${esc(formatDuration(h.durationMs))}
      </td>
    </tr>`,
          )
          .join("")}</table>${
          d.highlightsOverflow > 0
            ? `<p style="margin:6px 0 0;font-size:12px;color:${MUTED};">${esc(s.highlightsMore(d.highlightsOverflow))}</p>`
            : ""
        }`;

  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${esc(digestSubject(d, lang))}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;">
<!-- Preheader: the grey line clients show next to the subject. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(
    s.preheader(d.attention.length + d.attentionOverflow, d.highlights.length + d.highlightsOverflow),
  )}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${LINE};border-radius:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

    <tr><td style="padding:20px 24px;background:${BRAND};border-radius:13px 13px 0 0;">
      <div style="font-size:18px;font-weight:700;color:#ffffff;">Sideline365</div>
      <div style="font-size:13px;color:#d1fae5;padding-top:2px;">${esc(from)} – ${esc(to)}</div>
    </td></tr>

    <tr><td style="padding:22px 24px 0;">
      <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:${INK};">${esc(s.greeting(d.coachName))}</p>
      <p style="margin:0 0 16px;font-size:14px;color:${MUTED};">${esc(s.intro(from, to))}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        ${statCell(s.statActive, `${d.activeAthletes}/${d.squadSize}`)}
        ${statCell(s.statSessions, String(d.sessions), deltaLine(d, s))}
        ${statCell(s.statHours, (d.minutes / 60).toFixed(1))}
      </tr></table>
    </td></tr>

    <tr><td style="padding:22px 24px 0;">
      <h2 style="margin:0 0 10px;font-size:15px;font-weight:700;color:${INK};">${esc(s.attentionHeading)}</h2>
      ${attention}
    </td></tr>

    <tr><td style="padding:22px 24px 0;">
      <h2 style="margin:0 0 10px;font-size:15px;font-weight:700;color:${INK};">🏅 ${esc(s.highlightsHeading)}</h2>
      ${highlights}
    </td></tr>

    <tr><td style="padding:24px;" align="center">
      <a href="${esc(appUrl)}/coach" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 24px;border-radius:10px;">${esc(s.cta)}</a>
    </td></tr>

    <tr><td style="padding:0 24px 22px;border-top:1px solid ${LINE};">
      <p style="margin:14px 0 0;font-size:11px;line-height:1.6;color:#94a3b8;">${esc(s.footer)}<br>${esc(s.unsubscribe)}</p>
    </td></tr>

  </table>
</td></tr></table>
</body></html>`;
}
