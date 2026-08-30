import { expect, test } from "bun:test";

import {
  getNetScore,
  getStrokeTeamStandings,
  getTeamHoleNet,
  strokeScoreKey,
} from "./scoring";

import type { Player, VilaSolHole } from "../../config/eventSchemas";
import type { StrokeState } from "../../state/golfState";

const TEST_PLAYERS = [
  { id: "p1", image: "p1.webp", name: "Player 1" },
  { id: "p2", image: "p2.webp", name: "Player 2" },
  { id: "p3", image: "p3.webp", name: "Player 3" },
] as const satisfies readonly Player[];

const TEST_HOLES = [
  { id: "stroke-1", loop: "Out", number: 1, par: 4, si: 1 },
  { id: "stroke-2", loop: "Out", number: 2, par: 3, si: 18 },
] as const satisfies readonly VilaSolHole[];

const createState = (
  scores: StrokeState["scores"] = {},
  handicaps: StrokeState["handicaps"] = {},
): StrokeState => ({
  handicaps,
  locks: {},
  scores,
});

test("builds a stable score key from the player and hole IDs", () => {
  expect(strokeScoreKey("player-1", "hole-2")).toBe("player-1::hole-2");
});

test("converts gross scores to net scores using the hole stroke index", () => {
  expect(getNetScore(6, 0, 1)).toBe(6);
  expect(getNetScore(6, 19, 1)).toBe(4);
  expect(getNetScore(6, 19, 2)).toBe(5);
});

test("leaves a team hole incomplete until every player has a gross score", () => {
  const state = createState({
    [strokeScoreKey("p1", TEST_HOLES[0].id)]: 5,
    [strokeScoreKey("p2", TEST_HOLES[0].id)]: 4,
  });

  expect(getTeamHoleNet(state, TEST_PLAYERS, TEST_HOLES[0])).toBeUndefined();
});

test("selects the best two net scores from a completed team hole", () => {
  const state = createState(
    {
      [strokeScoreKey("p1", TEST_HOLES[0].id)]: 5,
      [strokeScoreKey("p2", TEST_HOLES[0].id)]: 5,
      [strokeScoreKey("p3", TEST_HOLES[0].id)]: 5,
    },
    { p1: 0, p2: 18, p3: 36 },
  );

  expect(getTeamHoleNet(state, TEST_PLAYERS, TEST_HOLES[0])).toEqual([
    { net: 3, playerId: "p3" },
    { net: 4, playerId: "p2" },
  ]);
});

test("aggregates completed team holes into totals and net to par", () => {
  const state = createState(
    {
      [strokeScoreKey("a1", "stroke-1")]: 5,
      [strokeScoreKey("a2", "stroke-1")]: 4,
      [strokeScoreKey("a3", "stroke-1")]: 7,
      [strokeScoreKey("a1", "stroke-2")]: 4,
      [strokeScoreKey("a2", "stroke-2")]: 3,
      [strokeScoreKey("a3", "stroke-2")]: 6,
      [strokeScoreKey("b1", "stroke-1")]: 4,
      [strokeScoreKey("b2", "stroke-1")]: 5,
      [strokeScoreKey("b3", "stroke-1")]: 9,
      [strokeScoreKey("c1", "stroke-1")]: 3,
      [strokeScoreKey("c2", "stroke-1")]: 3,
    },
    { a1: 18 },
  );

  expect(getStrokeTeamStandings(state, TEST_HOLES)).toEqual([
    { holesCompleted: 2, net: 14, netToPar: 0, teamId: "A" },
    { holesCompleted: 1, net: 9, netToPar: 1, teamId: "B" },
    { holesCompleted: 0, net: 0, teamId: "C" },
  ]);
});

test("orders tied and unplayed teams deterministically by team ID", () => {
  const tiedScores = {
    [strokeScoreKey("a1", "stroke-1")]: 4,
    [strokeScoreKey("a2", "stroke-1")]: 4,
    [strokeScoreKey("a3", "stroke-1")]: 9,
    [strokeScoreKey("b1", "stroke-1")]: 4,
    [strokeScoreKey("b2", "stroke-1")]: 4,
    [strokeScoreKey("b3", "stroke-1")]: 9,
  };
  const secondTeamScores = {
    [strokeScoreKey("b1", "stroke-1")]: 4,
    [strokeScoreKey("b2", "stroke-1")]: 4,
    [strokeScoreKey("b3", "stroke-1")]: 9,
  };

  expect(
    getStrokeTeamStandings(createState(tiedScores), [TEST_HOLES[0]]).map(
      ({ teamId }) => teamId,
    ),
  ).toEqual(["A", "B", "C"]);
  expect(
    getStrokeTeamStandings(createState(secondTeamScores), [TEST_HOLES[0]]).map(
      ({ teamId }) => teamId,
    ),
  ).toEqual(["B", "A", "C"]);
  expect(
    getStrokeTeamStandings(createState(), TEST_HOLES).map(
      ({ teamId }) => teamId,
    ),
  ).toEqual(["A", "B", "C"]);
});
