import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "./db";
import { loadSeason, type SeasonData } from "./seasonReport";
import { schoolYearLabel, termOf, type Term } from "./season";
import { matchResult } from "./teamLogText";
import {
  ATTENDANCE_SHEET_VALUE,
  MATCH_KIND_SHEET_VALUE,
  MATCH_PLAYER_SHEET_VALUE,
  SELF_EVAL,
  readDoc,
  readEvent,
  type SelfEvalDoc,
} from "./bitacora";
import { cellRef, patchWorkbook, type SheetPatch } from "./xlsxPatch";
import type { Prisma } from "@prisma/client";

// The official bitácora: the school's own workbook with the team's records
// written into its cells. Only cells the coach would type into are written;
// the sheets' formulas, charts, checkboxes and formatting are the school's.
// Cell positions below are the template's (src/data/bitacora).

const TEMPLATE = path.join(process.cwd(), "src/data/bitacora/bitacora-futbol-template.xlsx");

const SHEET = {
  sta: "STA-GRAL",
  b1: "B1- INFO Y CONTACTOS",
  b2: "B2- ASISTENCIAS",
  b3: "B3- PARTIDOS",
  b4: "B4- REND. Y ACTITUD DEP.",
  rfi: "R-FI",
  aevTerm: "A-EV (SEMESTRAL)",
  aevFinal: "A-EV (FINAL)",
  seve: "S-EVE",
} as const;

/** Rows for players: the workbook has room for 35. */
const PLAYER_ROWS = 35;

function colNum(letters: string): number {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

function cols(from: string, to: string): number[] {
  const out: number[] = [];
  for (let c = colNum(from); c <= colNum(to); c++) out.push(c);
  return out;
}

/** Excel's day number for a "YYYY-MM-DD" day (the template's date cells are formatted). */
function excelDate(day: string): number {
  return Math.round((Date.parse(`${day}T00:00:00Z`) - Date.UTC(1899, 11, 30)) / 86_400_000);
}

/** "27/10/2026", as dates are written in the school's forms. */
function dmy(day: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return day;
  const [y, m, d] = day.split("-");
  return `${d}/${m}/${y}`;
}

/** B1's birth-date column says "Mes/día/año". */
function mdy(day: string | null): string | null {
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return day;
  const [y, m, d] = day.split("-");
  return `${m}/${d}/${y}`;
}

const yy = (year: number) => `${String(year).slice(2)}-${String(year + 1).slice(2)}`;
const orNull = (v: string | null | undefined) => (v && v.trim() ? v : null);

// B2: the columns each month has in the register, August to June.
const B2_MONTHS: [number, string, string][] = [
  [8, "C", "F"],
  [9, "G", "U"],
  [10, "V", "AJ"],
  [11, "AK", "AY"],
  [12, "AZ", "BI"],
  [1, "BJ", "BX"],
  [2, "BY", "CM"],
  [3, "CN", "DB"],
  [4, "DC", "DQ"],
  [5, "DR", "EF"],
  [6, "EG", "ER"],
];

// A-EV: the rows of the "Maestro" column, in the order of SELF_EVAL's items.
const AEV_ROWS = {
  term: { col: "E", notes: "H", others: ["F", "G"], rows: [...range(11, 24), ...range(28, 31), ...range(38, 45), ...range(47, 53)] },
  final: { col: "C", notes: "F", others: ["D", "E"], rows: [...range(9, 22), ...range(27, 30), ...range(37, 44), ...range(46, 52)] },
};

function range(a: number, b: number): number[] {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

export interface ExportOptions {
  /** B4 shows one term's evaluations; defaults to the latest one with any. */
  term?: Term;
  /** S-EVE holds one request; defaults to the year's most recent. */
  eventId?: string;
  today: string;
}

export interface ExportTeam {
  id: string;
  name: string;
  category: string | null;
  branch: string | null;
  coachName: string;
}

export async function buildBitacora(team: ExportTeam, year: number, opts: ExportOptions): Promise<Buffer> {
  const [data, docs, events] = await Promise.all([
    loadSeason(team.id, year),
    prisma.teamSeasonDoc.findMany({ where: { teamId: team.id, year } }),
    prisma.teamEvent.findMany({
      where: { teamId: team.id, ...(opts.eventId ? { id: opts.eventId } : { year }) },
      orderBy: { createdAt: "desc" },
      take: 1,
      include: { matches: { orderBy: { day: "asc" }, include: { players: { select: { userId: true, status: true } } } } },
    }),
  ]);
  const doc = (kind: string) => docs.find((d) => d.kind === kind)?.data;
  const players = data.players.slice(0, PLAYER_ROWS);

  const patches: Record<string, SheetPatch> = {
    [SHEET.b1]: b1(team, players),
    [SHEET.b2]: b2(data, players),
    [SHEET.b3]: b3(data, players),
    [SHEET.b4]: b4(data, players, opts.term),
    [SHEET.sta]: sta(year, readDoc("goals", doc("goals"))),
    [SHEET.rfi]: rfi(data, players, readDoc("report", doc("report"))),
    [SHEET.aevTerm]: aev("term", year, readDoc("selfEvalTerm", doc("selfEvalTerm"))),
    [SHEET.aevFinal]: aev("final", year, readDoc("selfEvalFinal", doc("selfEvalFinal"))),
  };
  if (events[0]) patches[SHEET.seve] = seve(events[0], data, team, opts.today);

  return patchWorkbook(await readFile(TEMPLATE), patches);
}

function b1(team: ExportTeam, players: SeasonData["players"]): SheetPatch {
  const p: SheetPatch = { C1: team.coachName, C2: "FUTBOL", C3: team.category, C4: team.branch };
  for (let i = 0; i < PLAYER_ROWS; i++) {
    const r = 8 + i;
    const x = players[i];
    p[`B${r}`] = x?.name ?? null;
    p[`C${r}`] = x?.number ?? null;
    p[`D${r}`] = x?.curp ?? null;
    p[`E${r}`] = mdy(x?.birthDate ?? null);
    p[`F${r}`] = orNull(x?.guardians[0].name);
    p[`G${r}`] = orNull(x?.guardians[0].email);
    p[`H${r}`] = orNull(x?.guardians[0].phone);
    p[`I${r}`] = orNull(x?.guardians[1].name);
    p[`J${r}`] = orNull(x?.guardians[1].email);
    p[`K${r}`] = orNull(x?.guardians[1].phone);
  }
  return p;
}

function b2(data: SeasonData, players: SeasonData["players"]): SheetPatch {
  const p: SheetPatch = {};
  // The sheet's name column points at B1's "#" column; write the names.
  for (let i = 0; i < PLAYER_ROWS; i++) p[`B${6 + i}`] = players[i]?.name ?? null;
  for (const [month, from, to] of B2_MONTHS) {
    const slots = cols(from, to);
    const days = data.sessionDays.filter((d) => Number(d.slice(5, 7)) === month).slice(0, slots.length);
    slots.forEach((c, k) => {
      const day = days[k];
      p[cellRef(c, 5)] = day ? excelDate(day) : null;
      for (let i = 0; i < PLAYER_ROWS; i++) {
        const mark = day ? players[i]?.marks.get(day) : undefined;
        p[cellRef(c, 6 + i)] = mark ? ATTENDANCE_SHEET_VALUE[mark] : null;
      }
    });
    // "Entrenamientos realizados por mes": the divisor of each month's rate.
    p[`${from}42`] = days.length;
  }
  return p;
}

function b3(data: SeasonData, players: SeasonData["players"]): SheetPatch {
  const p: SheetPatch = {};
  const [t1, t2] = data.terms;
  const first = data.matches.filter((m) => termOf(m.day) === t1);
  const second = data.matches.filter((m) => termOf(m.day) === t2);
  // First term from D (27 columns), second from AE (9). A season that
  // outgrows either runs on in date order so no match is left out.
  const slots = cols("D", "AM");
  const placed: (SeasonData["matches"][number] | undefined)[] = Array(slots.length).fill(undefined);
  if (first.length <= 27 && second.length <= 9) {
    first.forEach((m, i) => (placed[i] = m));
    second.forEach((m, i) => (placed[27 + i] = m));
  } else {
    data.matches.slice(0, slots.length).forEach((m, i) => (placed[i] = m));
  }
  slots.forEach((c, k) => {
    const m = placed[k];
    const at = (row: number) => cellRef(c, row);
    p[at(4)] = m ? MATCH_KIND_SHEET_VALUE[m.kind] : null;
    p[at(5)] = m ? excelDate(m.day) : null;
    p[at(6)] = m ? `VS ${m.opponent.toUpperCase()}` : null;
    for (let i = 0; i < PLAYER_ROWS; i++) {
      const s = m && players[i] ? m.status.get(players[i].userId) : undefined;
      p[at(7 + i)] = s ? MATCH_PLAYER_SHEET_VALUE[s] : null;
    }
    const r = m ? matchResult(m.goalsFor, m.goalsAgainst) : null;
    p[at(44)] = r === "W";
    p[at(45)] = r === "D";
    p[at(46)] = r === "L";
    p[at(47)] = m ? m.goalsFor : null;
    p[at(48)] = m ? m.goalsAgainst : null;
    p[at(49)] = m && m.penaltiesFor != null && m.penaltiesAgainst != null ? `${m.penaltiesFor} - ${m.penaltiesAgainst}` : null;
  });
  // The per-term statistics panels are typed in the sheet, not computed.
  const r1 = data.records.term[t1];
  Object.assign(p, { AQ27: r1.played, AS27: r1.won, AU27: r1.drawn, AW27: r1.lost, AY27: r1.goalsFor, BA27: r1.goalsAgainst });
  const r2 = data.records.term[t2];
  Object.assign(p, { AQ44: r2.played, AS44: r2.won, AU44: r2.drawn, AW44: r2.lost, AY44: r2.goalsFor, BA44: r2.goalsAgainst });
  return p;
}

function b4(data: SeasonData, players: SeasonData["players"], asked?: Term): SheetPatch {
  const [t1, t2] = data.terms;
  const term = asked ?? (players.some((x) => x.evals[t2]) ? t2 : t1);
  const p: SheetPatch = {};
  const att = cols("C", "G");
  const perf = cols("I", "M");
  for (let i = 0; i < PLAYER_ROWS; i++) {
    const scores = players[i]?.evals[term]?.scores ?? [];
    const v = (k: number) => (scores[k] >= 6 && scores[k] <= 10 ? scores[k] : null);
    att.forEach((c, k) => (p[cellRef(c, 10 + i)] = v(k)));
    perf.forEach((c, k) => (p[cellRef(c, 10 + i)] = v(5 + k)));
  }
  return p;
}

function sta(year: number, goals: ReturnType<typeof readDoc<"goals">>): SheetPatch {
  const p: SheetPatch = { A5: schoolYearLabel(year), N5: `OBJETIVOS CICLO ${yy(year)}` };
  for (let i = 0; i < 18; i++) p[`O${6 + i}`] = orNull(goals.objectives[i]);
  p.A16 = orNull(goals.general);
  p.A25 = orNull(goals.specific);
  p.A37 = orNull(goals.teacher);
  return p;
}

function rfi(data: SeasonData, players: SeasonData["players"], report: ReturnType<typeof readDoc<"report">>): SheetPatch {
  const p: SheetPatch = {
    A4: `Reporte Anual ${yy(data.year)}`,
    H11: report.started ?? data.players.length + report.bajas.length,
    H12: data.players.length,
    // The template points this at B2's sum of every student's attendances,
    // so a season of 11 sessions read as 83. Write the sessions held, which
    // is what the line asks for (and what each student's count is out of).
    H13: data.sessionDays.length,
  };
  for (let i = 0; i < 5; i++) {
    const b = report.bajas[i];
    p[`A${56 + i}`] = orNull(b?.name);
    p[`E${56 + i}`] = orNull(b?.reason);
  }
  for (let i = 0; i < 7; i++) {
    const c = data.competitions[i];
    const r = 65 + i;
    p[`A${r}`] = c ? (c.name ?? MATCH_KIND_SHEET_VALUE[c.kind]) : null;
    p[`C${r}`] = c ? c.record.played : null;
    p[`D${r}`] = c ? c.record.won : null;
    p[`E${r}`] = c ? c.record.drawn : null;
    p[`F${r}`] = c ? c.record.lost : null;
    p[`G${r}`] = c ? orNull(report.places[c.key]) : null;
  }
  p.A75 = orNull(report.group);
  p.A79 = orNull(report.asomex);
  for (let i = 0; i < PLAYER_ROWS; i++) p[`D${85 + i}`] = players[i] ? orNull(report.individual[players[i].userId]) : null;
  for (let i = 0; i < 3; i++) {
    p[`A${123 + i}`] = orNull(report.incidents[i]?.who);
    p[`D${123 + i}`] = orNull(report.incidents[i]?.what);
  }
  p.A129 = orNull(report.wentWell);
  p.A132 = orNull(report.notDone);
  p.A135 = orNull(report.suggestions);
  // A138, the meeting notes, is marked "DEJAR EN BLANCO": the director fills it.
  return p;
}

function aev(kind: "term" | "final", year: number, self: SelfEvalDoc): SheetPatch {
  const layout = AEV_ROWS[kind];
  const items = SELF_EVAL.flatMap((s) => s.items);
  if (items.length !== layout.rows.length) throw new Error("A-EV rows out of step with the item list");
  const p: SheetPatch =
    kind === "term"
      ? { A3: schoolYearLabel(year), A4: `Evaluacion semestral: Diciembre ${year}`, H5: self.date ? dmy(self.date) : null }
      : { A3: schoolYearLabel(year), A4: `Evaluacion semestral: JUNIO ${year + 1}`, G5: self.date ? dmy(self.date) : null };
  items.forEach((item, i) => {
    const r = layout.rows[i];
    p[`${layout.col}${r}`] = self.scores[item.key] ?? null;
    p[`${layout.notes}${r}`] = orNull(self.notes[item.key]);
    // The coordinator's and director's columns are theirs to fill at the meeting.
    for (const c of layout.others) p[`${c}${r}`] = null;
  });
  return p;
}

type EventRow = Prisma.TeamEventGetPayload<{ include: { matches: { include: { players: { select: { userId: true; status: true } } } } } }>;

function seve(event: EventRow, data: SeasonData, team: ExportTeam, today: string): SheetPatch {
  const e = readEvent(event.data);
  const names = new Map(data.players.map((x) => [x.userId, x.name]));
  const invited = e.invited.filter((id) => names.has(id)).slice(0, 15);
  const outside = new Set(e.outsideCategory);
  const played = new Map<string, number>();
  for (const m of event.matches) for (const x of m.players) if (x.status === "ASISTIO") played.set(x.userId, (played.get(x.userId) ?? 0) + 1);

  const p: SheetPatch = {
    A5: `Programa Co-Curricular                               Fecha solicitud: ${e.requestDate ? dmy(e.requestDate) : ""}`,
    B7: orNull(e.name),
    C8: orNull(e.dates),
    A14: orNull(e.objective),
    H31: invited.filter((id) => !outside.has(id)).length,
    H32: invited.filter((id) => outside.has(id)).length,
    // Formatted as a date in the template (m-d), so a number would read
    // "12-31"; as text it shows as written.
    H33: String(event.matches.length),
    A65: orNull(e.analysis),
    A107: orNull(e.organization),
    F117: team.coachName,
    F118: dmy(today),
  };
  for (let i = 0; i < 15; i++) {
    const id = invited[i];
    p[`A${37 + i}`] = id ? names.get(id)! : null;
    p[`F${37 + i}`] = id ? (played.get(id) ?? 0) : null;
    p[`D${83 + i}`] = id ? orNull(e.individual[id]) : null;
  }
  for (let i = 0; i < 7; i++) {
    const m = event.matches[i];
    const r = 55 + i;
    const res = m ? matchResult(m.goalsFor, m.goalsAgainst) : null;
    const pens = m && m.penaltiesFor != null && m.penaltiesAgainst != null ? ` (${m.penaltiesFor}-${m.penaltiesAgainst} pen.)` : "";
    p[`A${r}`] = m ? m.opponent : null;
    p[`C${r}`] = m ? 1 : null;
    p[`D${r}`] = m ? (res === "W" ? 1 : 0) : null;
    p[`E${r}`] = m ? (res === "D" ? 1 : 0) : null;
    p[`F${r}`] = m ? (res === "L" ? 1 : 0) : null;
    p[`G${r}`] = m ? `${m.goalsFor} - ${m.goalsAgainst}${pens}` : null;
  }
  for (let i = 0; i < 3; i++) {
    p[`A${101 + i}`] = orNull(e.incidents[i]?.who);
    p[`D${101 + i}`] = orNull(e.incidents[i]?.what);
  }
  return p;
}
