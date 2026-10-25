import { matchResult } from "./teamLogText";

export interface MatchLine {
  goalsFor: number;
  goalsAgainst: number;
}

export interface TeamRecord {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  diff: number;
}

/** Played, won, drawn, lost, goals for and against: a league-table line. */
export function teamRecord(matches: MatchLine[]): TeamRecord {
  const r: TeamRecord = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, diff: 0 };
  for (const m of matches) {
    r.played += 1;
    const res = matchResult(m.goalsFor, m.goalsAgainst);
    if (res === "W") r.won += 1;
    else if (res === "D") r.drawn += 1;
    else r.lost += 1;
    r.goalsFor += m.goalsFor;
    r.goalsAgainst += m.goalsAgainst;
  }
  r.diff = r.goalsFor - r.goalsAgainst;
  return r;
}
