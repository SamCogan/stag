import { PUB_EVENT, PUB_PENALTIES } from "../../config/pubGolf";

import type { Player, PubHole, TeamId } from "../../config/eventSchemas";
import type { PubState } from "../../state/eventState";

export const scoreKey = (playerId: string, holeId: string): string =>
  `${playerId}::${holeId}`;

export const getGrossScore = (
  scores: PubState["scores"],
  playerId: string,
  holeId: string,
): number | undefined => scores[scoreKey(playerId, holeId)];

export const getPenaltyCounts = (
  penalties: PubState["penalties"],
  playerId: string,
  holeId: string,
): Readonly<Record<string, number>> =>
  penalties[scoreKey(playerId, holeId)] ?? {};

export const getPenaltyPoints = (
  counts: Readonly<Record<string, number>>,
): number =>
  PUB_PENALTIES.reduce(
    (total, penalty) => total + (counts[penalty.id] ?? 0) * penalty.points,
    0,
  );

export const getPlayerHoleTotal = (
  state: PubState,
  playerId: string,
  hole: PubHole,
): number | undefined => {
  const gross = getGrossScore(state.scores, playerId, hole.id);
  const penalties = getPenaltyPoints(
    getPenaltyCounts(state.penalties, playerId, hole.id),
  );

  if (gross === undefined) {
    return penalties > 0 ? penalties : undefined;
  }

  return gross + penalties;
};

export interface UsedScore {
  playerId: string;
  score: number;
}

export interface TeamHoleResult {
  total: number;
  usedScores: readonly UsedScore[];
}

export const getTeamHoleResult = (
  state: PubState,
  players: readonly Player[],
  hole: PubHole,
): TeamHoleResult | undefined => {
  const scores = players.map((player) => {
    const gross = getGrossScore(state.scores, player.id, hole.id);
    if (gross === undefined) {
      return;
    }

    return {
      playerId: player.id,
      score:
        gross +
        getPenaltyPoints(getPenaltyCounts(state.penalties, player.id, hole.id)),
    };
  });

  if (scores.includes(undefined)) {
    return undefined;
  }

  const usedScores = scores
    .filter((score): score is UsedScore => score !== undefined)
    .toSorted((left, right) => left.score - right.score)
    .slice(0, 2);

  return {
    total: usedScores.reduce((total, usedScore) => total + usedScore.score, 0),
    usedScores,
  };
};

export interface TeamStanding {
  holesCompleted: number;
  teamId: TeamId;
  toPar: number;
  total: number;
}

export const getPubTeamStandings = (state: PubState): TeamStanding[] =>
  (
    Object.entries(PUB_EVENT.teams) as [
      TeamId,
      (typeof PUB_EVENT.teams)[TeamId],
    ][]
  )
    .map(([teamId, team]) => {
      const results = PUB_EVENT.holes.flatMap((hole) => {
        const result = getTeamHoleResult(state, team.players, hole);
        return result === undefined ? [] : [{ hole, result }];
      });
      const total = results.reduce((sum, entry) => sum + entry.result.total, 0);
      const par = results.reduce((sum, entry) => sum + entry.hole.par * 2, 0);

      return {
        holesCompleted: results.length,
        teamId,
        total,
        toPar: total - par,
      };
    })
    .toSorted((left, right) => left.toPar - right.toPar);
