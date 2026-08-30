import { PUB_EVENT } from "../../config/pubGolf";

import type { TeamId, VilaSolHole } from "../../config/eventSchemas";
import type { ScrambleState } from "../../state/golfState";

export const scrambleScoreKey = (teamId: TeamId, holeId: string): string =>
  `${teamId}::${holeId}`;

export const getScrambleScore = (
  scores: ScrambleState["scores"],
  teamId: TeamId,
  holeId: string,
): number | undefined => scores[scrambleScoreKey(teamId, holeId)];

export interface ScrambleStanding {
  currentHole: number;
  holesCompleted: number;
  teamId: TeamId;
  toPar: number;
  total: number;
}

export const getScrambleStandings = (
  state: ScrambleState,
  holes: readonly VilaSolHole[],
): ScrambleStanding[] =>
  (Object.keys(PUB_EVENT.teams) as TeamId[])
    .map((teamId) => {
      const completed = holes.flatMap((hole, index) => {
        const score = getScrambleScore(state.scores, teamId, hole.id);
        return score === undefined ? [] : [{ hole, index, score }];
      });
      const total = completed.reduce((sum, entry) => sum + entry.score, 0);
      const par = completed.reduce((sum, entry) => sum + entry.hole.par, 0);
      const currentHole =
        completed.length === 0
          ? 0
          : Math.max(...completed.map((entry) => entry.index)) + 1;

      return {
        currentHole,
        holesCompleted: completed.length,
        teamId,
        total,
        toPar: total - par,
      };
    })
    .toSorted((left, right) => {
      if (left.holesCompleted === 0 && right.holesCompleted === 0) {
        return left.teamId.localeCompare(right.teamId);
      }

      if (left.holesCompleted === 0) {
        return 1;
      }

      if (right.holesCompleted === 0) {
        return -1;
      }

      return left.toPar - right.toPar || left.total - right.total;
    });

export const getDriveCounts = (
  state: ScrambleState,
  teamId: TeamId,
  holes: readonly VilaSolHole[],
): Readonly<Record<string, number>> => {
  const playerIds = PUB_EVENT.teams[teamId].players.map((player) => player.id);
  const counts = Object.fromEntries(playerIds.map((playerId) => [playerId, 0]));

  for (const hole of holes) {
    const playerId = state.drives[scrambleScoreKey(teamId, hole.id)];
    if (playerId !== undefined && Object.hasOwn(counts, playerId)) {
      counts[playerId] = (counts[playerId] ?? 0) + 1;
    }
  }

  return counts;
};
