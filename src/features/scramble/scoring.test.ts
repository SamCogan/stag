import { expect, test } from "bun:test";

import {
  getDriveCounts,
  getScrambleScore,
  getScrambleStandings,
  scrambleScoreKey,
} from "./scoring";

import type { VilaSolHole } from "../../config/eventSchemas";
import type { ScrambleState } from "../../state/golfState";

const TEST_HOLES = [
  { id: "selected-1", loop: "Out", number: 1, par: 4, si: 1 },
  { id: "selected-2", loop: "Out", number: 2, par: 3, si: 2 },
  { id: "selected-3", loop: "Out", number: 3, par: 5, si: 3 },
] as const satisfies readonly VilaSolHole[];

const createState = (
  scores: ScrambleState["scores"] = {},
  drives: ScrambleState["drives"] = {},
): ScrambleState => ({
  drives,
  locks: {},
  scores,
});

test("builds a stable score key from the team and hole IDs", () => {
  expect(scrambleScoreKey("A", "v12")).toBe("A::v12");
});

test("looks up a scramble score by team and hole", () => {
  const scores = { [scrambleScoreKey("A", "v1")]: 4 };

  expect(getScrambleScore(scores, "A", "v1")).toBe(4);
  expect(getScrambleScore(scores, "A", "v2")).toBeUndefined();
  expect(getScrambleScore(scores, "B", "v1")).toBeUndefined();
});

test("calculates standings from selected holes and retains unplayed teams", () => {
  const state = createState({
    [scrambleScoreKey("A", "excluded")]: 20,
    [scrambleScoreKey("A", "selected-1")]: 5,
    [scrambleScoreKey("A", "selected-3")]: 4,
    [scrambleScoreKey("B", "selected-2")]: 2,
  });

  expect(getScrambleStandings(state, TEST_HOLES)).toEqual([
    { currentHole: 2, holesCompleted: 1, teamId: "B", toPar: -1, total: 2 },
    { currentHole: 3, holesCompleted: 2, teamId: "A", toPar: 0, total: 9 },
    { currentHole: 0, holesCompleted: 0, teamId: "C", toPar: 0, total: 0 },
  ]);
});

test("orders tied and unplayed teams deterministically by team ID", () => {
  const tiedScores = {
    [scrambleScoreKey("A", "selected-1")]: 4,
    [scrambleScoreKey("B", "selected-1")]: 4,
  };

  expect(
    getScrambleStandings(createState(tiedScores), TEST_HOLES).map(
      ({ teamId }) => teamId,
    ),
  ).toEqual(["A", "B", "C"]);
  expect(
    getScrambleStandings(createState(), TEST_HOLES).map(({ teamId }) => teamId),
  ).toEqual(["A", "B", "C"]);
});

test("counts drives only for the selected team, players, and holes", () => {
  const state = createState(
    {},
    {
      [scrambleScoreKey("A", "excluded")]: "a1",
      [scrambleScoreKey("A", "selected-1")]: "a1",
      [scrambleScoreKey("A", "selected-2")]: "a2",
      [scrambleScoreKey("A", "selected-3")]: "b1",
      [scrambleScoreKey("B", "selected-1")]: "b1",
    },
  );

  expect(getDriveCounts(state, "A", TEST_HOLES)).toEqual({
    a1: 1,
    a2: 1,
    a3: 0,
  });
});
