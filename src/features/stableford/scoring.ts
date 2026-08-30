import { STABLEFORD_CONFIG } from "./config";
import { getHandicapStrokes } from "../golf/handicap";

import type { StablefordHole, StablefordPlayer } from "./config";

export type StablefordScores = Readonly<Record<string, number>>;
export type StablefordPickups = Readonly<Record<string, boolean>>;
export type StablefordHandicaps = Readonly<Record<string, number>>;

export interface StablefordScoringState {
  handicaps: StablefordHandicaps;
  pickups: StablefordPickups;
  scores: StablefordScores;
}

interface BaseHoleResult {
  completed: boolean;
  points: number;
  strokesReceived: number;
}

export type StablefordHoleResult =
  | (BaseHoleResult & {
      completed: false;
      status: "unplayed";
    })
  | (BaseHoleResult & {
      completed: true;
      status: "picked-up";
    })
  | (BaseHoleResult & {
      completed: true;
      gross: number;
      net: number;
      status: "scored";
    });

export const stablefordScoreKey = (playerId: string, holeId: string): string =>
  `${playerId}::${holeId}`;

export const getStablefordPoints = (
  gross: number,
  playingHandicap: number,
  hole: StablefordHole,
): number => {
  const net = gross - getHandicapStrokes(playingHandicap, hole.strokeIndex);
  return Math.max(0, 2 + hole.par - net);
};

export const getStablefordHoleResult = (
  state: StablefordScoringState,
  playerId: string,
  playingHandicap: number,
  hole: StablefordHole,
): StablefordHoleResult => {
  const key = stablefordScoreKey(playerId, hole.id);
  const strokesReceived = getHandicapStrokes(playingHandicap, hole.strokeIndex);

  if (state.pickups[key] === true) {
    return {
      completed: true,
      points: 0,
      status: "picked-up",
      strokesReceived,
    };
  }

  const gross = state.scores[key];
  if (gross === undefined) {
    return {
      completed: false,
      points: 0,
      status: "unplayed",
      strokesReceived,
    };
  }

  const net = gross - strokesReceived;
  return {
    completed: true,
    gross,
    net,
    points: Math.max(0, 2 + hole.par - net),
    status: "scored",
    strokesReceived,
  };
};

export interface StablefordPlayerSummary {
  backNinePoints: number;
  frontNinePoints: number;
  handicap: number;
  holesCompleted: number;
  player: StablefordPlayer;
  position?: number;
  totalPoints: number;
}

export const getStablefordPlayerSummary = (
  state: StablefordScoringState,
  player: StablefordPlayer,
): StablefordPlayerSummary => {
  const handicap = state.handicaps[player.id] ?? player.handicap;
  const results = STABLEFORD_CONFIG.holes.map((hole) =>
    getStablefordHoleResult(state, player.id, handicap, hole),
  );

  return {
    backNinePoints: results
      .slice(9)
      .reduce((total, result) => total + result.points, 0),
    frontNinePoints: results
      .slice(0, 9)
      .reduce((total, result) => total + result.points, 0),
    handicap,
    holesCompleted: results.filter((result) => result.completed).length,
    player,
    totalPoints: results.reduce((total, result) => total + result.points, 0),
  };
};

export const getStablefordLeaderboard = (
  state: StablefordScoringState,
): StablefordPlayerSummary[] => {
  const sorted = STABLEFORD_CONFIG.players
    .map((player) => getStablefordPlayerSummary(state, player))
    .toSorted(
      (left, right) =>
        right.totalPoints - left.totalPoints ||
        right.holesCompleted - left.holesCompleted ||
        left.player.name.localeCompare(right.player.name),
    );

  let previousPoints: number | undefined;
  let previousPosition = 0;

  return sorted.map((summary, index) => {
    if (summary.totalPoints !== previousPoints) {
      previousPosition = index + 1;
      previousPoints = summary.totalPoints;
    }

    return { ...summary, position: previousPosition };
  });
};
