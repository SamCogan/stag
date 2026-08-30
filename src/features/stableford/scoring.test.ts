import { expect, test } from "bun:test";

import { STABLEFORD_CONFIG } from "./config";
import {
  getStablefordHoleResult,
  getStablefordLeaderboard,
  getStablefordPlayerSummary,
  getStablefordPoints,
  stablefordScoreKey,
} from "./scoring";

import type { StablefordHole, StablefordPlayer } from "./config";
import type { StablefordScoringState } from "./scoring";

const createState = (
  scores: StablefordScoringState["scores"] = {},
  pickups: StablefordScoringState["pickups"] = {},
  handicaps: StablefordScoringState["handicaps"] = {},
): StablefordScoringState => ({ handicaps, pickups, scores });

const getHoleByNumber = (number: number): StablefordHole => {
  const hole = STABLEFORD_CONFIG.holes.find((entry) => entry.number === number);

  if (hole === undefined) {
    throw new Error(`Missing Stableford hole ${String(number)}`);
  }

  return hole;
};

const getHoleByStrokeIndex = (strokeIndex: number): StablefordHole => {
  const hole = STABLEFORD_CONFIG.holes.find(
    (entry) => entry.strokeIndex === strokeIndex,
  );

  if (hole === undefined) {
    throw new Error(`Missing Stableford stroke index ${String(strokeIndex)}`);
  }

  return hole;
};

const getPlayer = (playerId: string): StablefordPlayer => {
  const player = STABLEFORD_CONFIG.players.find(
    (entry) => entry.id === playerId,
  );

  if (player === undefined) {
    throw new Error(`Missing Stableford player ${playerId}`);
  }

  return player;
};

const createLeaderboardState = (): StablefordScoringState => {
  const hole1 = getHoleByNumber(1);
  const hole2 = getHoleByNumber(2);

  return createState(
    {
      [stablefordScoreKey("aaron", hole1.id)]: hole1.par - 2,
      [stablefordScoreKey("jack", hole1.id)]: hole1.par,
      [stablefordScoreKey("jack", hole2.id)]: hole2.par,
      [stablefordScoreKey("kyle", hole1.id)]: hole1.par - 1,
    },
    {},
    { aaron: 0, jack: 0, kyle: 0 },
  );
};

test("scores Sam's gross 7 on hole 1 as net 5 for 1 point", () => {
  const hole = getHoleByNumber(1);
  const sam = getPlayer("sam");
  const state = createState({
    [stablefordScoreKey(sam.id, hole.id)]: 7,
  });

  expect(getStablefordHoleResult(state, sam.id, sam.handicap, hole)).toEqual({
    completed: true,
    gross: 7,
    net: 5,
    points: 1,
    status: "scored",
    strokesReceived: 2,
  });
});

test("scores Paul C's gross 5 on hole 1 as net 4 for 2 points", () => {
  const hole = getHoleByNumber(1);
  const paul = getPlayer("paulc");
  const state = createState({
    [stablefordScoreKey(paul.id, hole.id)]: 5,
  });

  expect(getStablefordHoleResult(state, paul.id, paul.handicap, hole)).toEqual({
    completed: true,
    gross: 5,
    net: 4,
    points: 2,
    status: "scored",
    strokesReceived: 1,
  });
});

test("gives Paul C no stroke on stroke index 6", () => {
  const hole = getHoleByStrokeIndex(6);
  const paul = getPlayer("paulc");
  const state = createState({
    [stablefordScoreKey(paul.id, hole.id)]: hole.par,
  });

  expect(
    getStablefordHoleResult(state, paul.id, paul.handicap, hole),
  ).toMatchObject({
    net: hole.par,
    points: 2,
    strokesReceived: 0,
  });
});

test("gives Kyle two strokes on stroke index 14 and one on 15", () => {
  const strokeIndex14 = getHoleByStrokeIndex(14);
  const strokeIndex15 = getHoleByStrokeIndex(15);
  const kyle = getPlayer("kyle");
  const state = createState({
    [stablefordScoreKey(kyle.id, strokeIndex14.id)]: strokeIndex14.par,
    [stablefordScoreKey(kyle.id, strokeIndex15.id)]: strokeIndex15.par,
  });

  expect(
    getStablefordHoleResult(state, kyle.id, kyle.handicap, strokeIndex14)
      .strokesReceived,
  ).toBe(2);
  expect(
    getStablefordHoleResult(state, kyle.id, kyle.handicap, strokeIndex15)
      .strokesReceived,
  ).toBe(1);
});

test("gives Ian two strokes on indexes 1-11 and one on 12-18", () => {
  const ian = getPlayer("ian");
  const strokesByIndex = STABLEFORD_CONFIG.holes
    .map(
      (hole) =>
        [
          hole.strokeIndex,
          getStablefordHoleResult(createState(), ian.id, ian.handicap, hole)
            .strokesReceived,
        ] as const,
    )
    .toSorted(([left], [right]) => left - right);

  expect(strokesByIndex).toEqual([
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [7, 2],
    [8, 2],
    [9, 2],
    [10, 2],
    [11, 2],
    [12, 1],
    [13, 1],
    [14, 1],
    [15, 1],
    [16, 1],
    [17, 1],
    [18, 1],
  ]);
});

test("counts a pickup without a gross score as completed for zero points", () => {
  const hole = getHoleByNumber(1);
  const sam = getPlayer("sam");
  const state = createState(
    {},
    { [stablefordScoreKey(sam.id, hole.id)]: true },
  );

  expect(getStablefordHoleResult(state, sam.id, sam.handicap, hole)).toEqual({
    completed: true,
    points: 0,
    status: "picked-up",
    strokesReceived: 2,
  });
});

test("treats a blank hole as unplayed", () => {
  const hole = getHoleByNumber(1);
  const paul = getPlayer("paulc");

  expect(
    getStablefordHoleResult(createState(), paul.id, paul.handicap, hole),
  ).toEqual({
    completed: false,
    points: 0,
    status: "unplayed",
    strokesReceived: 1,
  });
});

test("does not cap positive Stableford points", () => {
  expect(getStablefordPoints(1, 36, getHoleByNumber(1))).toBe(7);
});

test("summarizes front, back, total points, and completed holes", () => {
  const sam = getPlayer("sam");
  const hole1 = getHoleByNumber(1);
  const hole9 = getHoleByNumber(9);
  const hole10 = getHoleByNumber(10);
  const hole18 = getHoleByNumber(18);
  const state = createState(
    {
      [stablefordScoreKey(sam.id, hole1.id)]: hole1.par,
      [stablefordScoreKey(sam.id, hole9.id)]: hole9.par - 1,
      [stablefordScoreKey(sam.id, hole10.id)]: hole10.par,
    },
    { [stablefordScoreKey(sam.id, hole18.id)]: true },
    { [sam.id]: 0 },
  );

  expect(getStablefordPlayerSummary(state, sam)).toEqual({
    backNinePoints: 2,
    frontNinePoints: 5,
    handicap: 0,
    holesCompleted: 4,
    player: sam,
    totalPoints: 7,
  });
});

test("sorts deterministically by points, holes completed, and player name", () => {
  expect(
    getStablefordLeaderboard(createLeaderboardState()).map(
      ({ player }) => player.name,
    ),
  ).toEqual([
    "Jack",
    "Aaron",
    "Kyle",
    "Ian",
    "Jack H",
    "James W",
    "Jamie",
    "Joe W",
    "Paul C",
    "Paul W",
    "Sam",
    "Ste",
  ]);
});

test("shares displayed positions for equal total points", () => {
  expect(
    getStablefordLeaderboard(createLeaderboardState()).map(
      ({ position }) => position,
    ),
  ).toEqual([1, 1, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
});
