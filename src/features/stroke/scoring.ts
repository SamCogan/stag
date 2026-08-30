import { PUB_EVENT } from "../../config/pubGolf";
import { getHandicapStrokes } from "../golf/handicap";

import type { Player, TeamId, VilaSolHole } from "../../config/eventSchemas";
import type { StrokeState } from "../../state/golfState";

export const strokeScoreKey = (playerId: string, holeId: string): string =>
  `${playerId}::${holeId}`;

export const getNetScore = (
  gross: number,
  playingHandicap: number,
  strokeIndex: number,
): number => gross - getHandicapStrokes(playingHandicap, strokeIndex);

interface UsedNetScore {
  net: number;
  playerId: string;
}

export const getTeamHoleNet = (
  state: StrokeState,
  players: readonly Player[],
  hole: VilaSolHole,
): readonly UsedNetScore[] | undefined => {
  const scores = players.map((player) => {
    const gross = state.scores[strokeScoreKey(player.id, hole.id)];
    if (gross === undefined) {
      return;
    }

    return {
      net: getNetScore(gross, state.handicaps[player.id] ?? 0, hole.si),
      playerId: player.id,
    };
  });

  if (scores.includes(undefined)) {
    return;
  }

  return scores
    .filter((score): score is UsedNetScore => score !== undefined)
    .toSorted((left, right) => left.net - right.net)
    .slice(0, 2);
};

export interface StrokeTeamStanding {
  holesCompleted: number;
  net: number;
  netToPar?: number;
  teamId: TeamId;
}

export const getStrokeTeamStandings = (
  state: StrokeState,
  holes: readonly VilaSolHole[],
): StrokeTeamStanding[] =>
  (Object.keys(PUB_EVENT.teams) as TeamId[])
    .map((teamId) => {
      const team = PUB_EVENT.teams[teamId];
      const completed = holes.flatMap((hole) => {
        const usedScores = getTeamHoleNet(state, team.players, hole);
        return usedScores === undefined ? [] : [{ hole, usedScores }];
      });
      const net = completed.reduce(
        (total, entry) =>
          total +
          entry.usedScores.reduce(
            (holeTotal, score) => holeTotal + score.net,
            0,
          ),
        0,
      );
      const par = completed.reduce(
        (total, entry) => total + entry.hole.par * 2,
        0,
      );

      return {
        holesCompleted: completed.length,
        net,
        ...(completed.length > 0 ? { netToPar: net - par } : {}),
        teamId,
      };
    })
    .toSorted((left, right) => {
      if (left.netToPar === undefined && right.netToPar === undefined) {
        return left.teamId.localeCompare(right.teamId);
      }
      if (left.netToPar === undefined) {
        return 1;
      }
      if (right.netToPar === undefined) {
        return -1;
      }
      return left.netToPar - right.netToPar || left.net - right.net;
    });
