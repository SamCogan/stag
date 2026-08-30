import { expect, test } from "bun:test";

import {
  getGrossScore,
  getPenaltyPoints,
  getPlayerHoleTotal,
  getPubTeamStandings,
  getTeamHoleResult,
  scoreKey,
} from "./scoring";
import { PUB_EVENT } from "../../config/pubGolf";

import type { Player, PubHole } from "../../config/eventSchemas";
import type { PubState } from "../../state/eventState";

const TEST_HOLE = {
  id: "test-hole",
  name: "Test drink",
  par: 3,
  pub: "Test pub",
} satisfies PubHole;

const TEST_PLAYERS = [
  { id: "p1", image: "p1.webp", name: "Player 1" },
  { id: "p2", image: "p2.webp", name: "Player 2" },
  { id: "p3", image: "p3.webp", name: "Player 3" },
] as const satisfies readonly Player[];

const createState = (
  scores: PubState["scores"] = {},
  penalties: PubState["penalties"] = {},
): PubState => ({
  locks: {},
  penalties,
  scores,
});

test("builds a stable score key from the player and hole IDs", () => {
  expect(scoreKey("player-1", "hole-2")).toBe("player-1::hole-2");
});

test("looks up a gross score by player and hole", () => {
  const scores = { [scoreKey("p1", TEST_HOLE.id)]: 4 };

  expect(getGrossScore(scores, "p1", TEST_HOLE.id)).toBe(4);
  expect(getGrossScore(scores, "p2", TEST_HOLE.id)).toBeUndefined();
});

test("totals weighted penalty counts and ignores unknown penalties", () => {
  expect(
    getPenaltyPoints({
      refuse: 2,
      sick: 1,
      spill: 2,
      toilet: 3,
      unknown: 100,
    }),
  ).toBe(14);
});

test("adds penalty points to a player's gross hole score", () => {
  const state = createState(
    { [scoreKey("p1", TEST_HOLE.id)]: 4 },
    { [scoreKey("p1", TEST_HOLE.id)]: { sick: 1, spill: 2 } },
  );

  expect(getPlayerHoleTotal(state, "p1", TEST_HOLE)).toBe(11);
});

test("handles player penalties when a gross score is missing", () => {
  const penaltiesOnly = createState(
    {},
    { [scoreKey("p1", TEST_HOLE.id)]: { refuse: 2 } },
  );

  expect(getPlayerHoleTotal(penaltiesOnly, "p1", TEST_HOLE)).toBe(4);
  expect(getPlayerHoleTotal(createState(), "p1", TEST_HOLE)).toBeUndefined();
});

test("leaves a team hole incomplete until every player has a gross score", () => {
  const state = createState(
    {
      [scoreKey("p1", TEST_HOLE.id)]: 2,
      [scoreKey("p2", TEST_HOLE.id)]: 3,
    },
    { [scoreKey("p3", TEST_HOLE.id)]: { spill: 4 } },
  );

  expect(getTeamHoleResult(state, TEST_PLAYERS, TEST_HOLE)).toBeUndefined();
});

test("selects the best two penalty-adjusted scores from a completed team hole", () => {
  const state = createState(
    {
      [scoreKey("p1", TEST_HOLE.id)]: 2,
      [scoreKey("p2", TEST_HOLE.id)]: 4,
      [scoreKey("p3", TEST_HOLE.id)]: 3,
    },
    {
      [scoreKey("p1", TEST_HOLE.id)]: { sick: 1 },
      [scoreKey("p3", TEST_HOLE.id)]: { spill: 2 },
    },
  );

  expect(getTeamHoleResult(state, TEST_PLAYERS, TEST_HOLE)).toEqual({
    total: 9,
    usedScores: [
      { playerId: "p2", score: 4 },
      { playerId: "p3", score: 5 },
    ],
  });
});

test("aggregates completed holes and sorts standings by score to par", () => {
  const state = createState({
    [scoreKey("a1", "h1")]: 2,
    [scoreKey("a2", "h1")]: 3,
    [scoreKey("a3", "h1")]: 9,
    [scoreKey("a1", "h2")]: 2,
    [scoreKey("a2", "h2")]: 2,
    [scoreKey("a3", "h2")]: 9,
    [scoreKey("b1", "h1")]: 4,
    [scoreKey("b2", "h1")]: 4,
    [scoreKey("b3", "h1")]: 9,
    [scoreKey("c1", "h1")]: 3,
    [scoreKey("c2", "h1")]: 3,
    [scoreKey("c3", "h1")]: 9,
  });

  expect(PUB_EVENT.holes[0]?.par).toBe(3);
  expect(PUB_EVENT.holes[1]?.par).toBe(2);
  expect(getPubTeamStandings(state)).toEqual([
    { holesCompleted: 2, teamId: "A", toPar: -1, total: 9 },
    { holesCompleted: 1, teamId: "C", toPar: 0, total: 6 },
    { holesCompleted: 1, teamId: "B", toPar: 2, total: 8 },
  ]);
});
