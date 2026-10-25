import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { fail } from "@/lib/api";
import { getLang } from "@/lib/getLang";
import { dayKeyIn } from "@/lib/format";
import { teamTimeZone } from "@/lib/teamAccess";
import { loadSeason } from "@/lib/seasonReport";
import { schoolYearLabel, schoolYearOf, termLabel } from "@/lib/season";
import { matchResult, tl } from "@/lib/teamLogText";
import type { Lang } from "@/lib/i18n";

export const runtime = "nodejs";

const MARK: Record<Lang, Record<"P" | "A" | "J", string>> = {
  ko: { P: "출", A: "결", J: "사" },
  en: { P: "P", A: "A", J: "E" },
  es: { P: "A", A: "F", J: "J" },
};

const HEADER_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };

/**
 * The season log as an Excel workbook: roster, attendance register, matches,
 * evaluations and the training plan, one sheet each. A school that keeps its
 * coach logs in Excel gets the same information in the same shape, without
 * the coach copying anything by hand.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);
  const { id } = await params;
  const team = await prisma.team.findUnique({
    where: { id },
    select: { name: true, coachId: true, category: true, branch: true, timeZone: true, coach: { select: { name: true } } },
  });
  if (!team || team.coachId !== session.userId) return fail("Team not found", 404);

  const lang = await getLang();
  const s = tl(lang);
  const today = dayKeyIn(teamTimeZone(team));
  const asked = Number(new URL(req.url).searchParams.get("year"));
  const year = Number.isInteger(asked) && asked > 2000 && asked <= schoolYearOf(today) ? asked : schoolYearOf(today);
  const data = await loadSeason(id, year);
  const names = new Map(data.players.map((p) => [p.userId, p.name]));

  const wb = new ExcelJS.Workbook();
  wb.creator = "Sideline365";
  wb.created = new Date();

  function sheet(title: string, headers: string[], widths: number[]) {
    const ws = wb.addWorksheet(title.slice(0, 31));
    ws.addRow([`${team!.name} · ${schoolYearLabel(year)} · ${title}`]).font = { bold: true, size: 13 };
    ws.addRow([
      [`${s.season.coach}: ${team!.coach.name}`, team!.category && `${s.roster.category}: ${team!.category}`, team!.branch && `${s.roster.branch}: ${team!.branch}`]
        .filter(Boolean)
        .join("   "),
    ]);
    ws.addRow([]);
    const h = ws.addRow(headers);
    h.font = { bold: true };
    h.eachCell((c) => (c.fill = HEADER_FILL));
    widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));
    ws.views = [{ state: "frozen", ySplit: 4, xSplit: 1 }];
    return ws;
  }

  // Roster
  const r = s.roster;
  const roster = sheet(s.tabs.roster, [
    r.name, r.number, r.birthDate,
    `${r.guardian1} · ${r.name}`, `${r.guardian1} · ${r.email}`, `${r.guardian1} · ${r.phone}`,
    `${r.guardian2} · ${r.name}`, `${r.guardian2} · ${r.email}`, `${r.guardian2} · ${r.phone}`,
  ], [28, 6, 13, 22, 26, 16, 22, 26, 16]);
  for (const p of data.players)
    roster.addRow([p.name, p.number, p.birthDate, ...p.guardians.flatMap((g) => [g.name, g.email, g.phone])]);

  // Attendance register: one column per day the register was taken.
  const a = s.attendance;
  const days = data.sessionDays;
  const reg = sheet(s.tabs.attendance, [s.common.player, ...days.map((d) => d.slice(5)), a.present, a.absent, a.excused, a.rate], [
    28, ...days.map(() => 6), 11, 9, 11, 9,
  ]);
  for (const p of data.players) {
    const marked = p.present + p.absent + p.excused;
    reg.addRow([
      p.name,
      ...days.map((d) => (p.marks.has(d) ? MARK[lang][p.marks.get(d)!] : "")),
      p.present,
      p.absent,
      p.excused,
      marked ? Math.round((p.present / marked) * 100) / 100 : null,
    ]);
  }
  reg.getColumn(days.length + 5).numFmt = "0%";
  reg.addRow([]);
  reg.addRow([`${MARK[lang].P} = ${a.present} · ${MARK[lang].A} = ${a.absent} · ${MARK[lang].J} = ${a.excused}`]).font = { italic: true };

  // Matches
  const m = s.matches;
  const ms = sheet(s.tabs.matches, [m.date, m.kind, m.competition, m.opponent, m.ourGoals, m.theirGoals, "", m.played], [12, 12, 20, 24, 10, 10, 5, 60]);
  for (const x of data.matches)
    ms.addRow([
      x.day, m.kinds[x.kind], x.competition, x.opponent, x.goalsFor, x.goalsAgainst,
      m.result[matchResult(x.goalsFor, x.goalsAgainst)],
      x.players.map((p) => names.get(p)).filter(Boolean).join(", "),
    ]);
  ms.addRow([]);
  const recHead = ms.addRow(["", m.pj, m.pg, m.pe, m.pp, m.gf, m.gc, m.dif]);
  recHead.font = { bold: true };
  for (const [label, rec] of [
    ...data.terms.map((t) => [termLabel(t, lang), data.records.term[t]] as const),
    [s.common.total, data.records.total] as const,
  ])
    ms.addRow([label, rec.played, rec.won, rec.drawn, rec.lost, rec.goalsFor, rec.goalsAgainst, rec.diff]);
  ms.addRow([]);
  ms.addRow([m.byPlayer]).font = { bold: true };
  for (const p of data.players) ms.addRow([p.name, p.matches]);

  // Evaluations
  const e = s.evaluations;
  const ev = sheet(s.tabs.evaluations, [s.common.term, s.common.player, "A1", "A2", "A3", "A4", "A5", "R1", "R2", "R3", "R4", "R5", "%", e.noteLabel], [
    20, 28, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 7, 50,
  ]);
  for (const t of data.terms)
    for (const p of data.players) {
      const v = p.evals[t];
      if (!v) continue;
      ev.addRow([termLabel(t, lang), p.name, ...v.scores.map((x) => x || null), v.percent != null ? v.percent / 100 : null, v.note]);
    }
  ev.getColumn(13).numFmt = "0%";
  ev.addRow([]);
  e.criteria.forEach((c, i) => ev.addRow([`${i < 5 ? "A" : "R"}${(i % 5) + 1}`, c]));
  ev.addRow([[5, 4, 3, 2, 1].map((v) => `${v} = ${e.scale[v]}`).join(" · ")]);

  // Plan
  const pl = s.plan;
  const plan = sheet(s.tabs.plan, [pl.weekOf, pl.unit, pl.objective, pl.note], [12, 30, 80, 36]);
  for (const w of data.plan) plan.addRow([w.weekStart, w.unit, w.objective, w.note]);

  const buf = await wb.xlsx.writeBuffer();
  const file = `${team.name.replace(/[^\p{L}\p{N} _-]+/gu, "").trim() || "team"}-${schoolYearLabel(year)}.xlsx`;
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="bitacora-${schoolYearLabel(year)}.xlsx"; filename*=UTF-8''${encodeURIComponent(file)}`,
      "Cache-Control": "no-store",
    },
  });
}
