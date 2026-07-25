// Registry of mini-games. Keeping the ids + max score in one place lets the
// score API validate submissions and the leaderboard label itself.
export const GAMES = {
  bullseye: { id: "bullseye", shots: 5, perShotMax: 100 },
} as const;

export type GameId = keyof typeof GAMES;

export function isGameId(v: string): v is GameId {
  return Object.prototype.hasOwnProperty.call(GAMES, v);
}

export function maxScore(id: GameId): number {
  return GAMES[id].shots * GAMES[id].perShotMax;
}
