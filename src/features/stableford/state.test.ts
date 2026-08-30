import { expect, test } from "bun:test";

import { STABLEFORD_CONFIG } from "./config";
import { getStablefordHoleResult, stablefordScoreKey } from "./scoring";
import {
  clearStablefordHole,
  EMPTY_STABLEFORD_STATE,
  parseStablefordState,
  setStablefordGroup,
  setStablefordHandicap,
  setStablefordPickup,
  setStablefordScore,
  validateStablefordGroups,
} from "./state";

import type { StablefordHole } from "./config";

const EXPECTED_GROUP_NAMES = {
  A: "Group A",
  B: "Group B",
  C: "Group C",
} as const;

const EXPECTED_GROUPS = {
  aaron: "B",
  ian: "A",
  jack: "B",
  jackh: "B",
  jamesw: "B",
  jamie: "C",
  joew: "C",
  kyle: "A",
  paulc: "A",
  paulw: "C",
  sam: "A",
  ste: "C",
} as const;

const EXPECTED_HANDICAPS = {
  aaron: 24,
  ian: 29,
  jack: 12,
  jackh: 24,
  jamesw: 10,
  jamie: 18,
  joew: 17,
  kyle: 32,
  paulc: 5,
  paulw: 29,
  sam: 32,
  ste: 16,
} as const;

const INVALID_SCORES = [
  ["zero", 0],
  ["a negative number", -1],
  ["a fraction", 1.5],
  ["NaN", Number.NaN],
  ["infinity", Number.POSITIVE_INFINITY],
] as const;

const INVALID_PERSISTED_SCORES = [
  ["a string", "7"],
  ...INVALID_SCORES,
] as const;

const INVALID_HANDICAPS = [
  ["below the minimum", -1],
  ["above the maximum", 55],
  ["fractional", 12.5],
  ["NaN", Number.NaN],
] as const;

const compareAlphabetically = (left: string, right: string): number =>
  left.localeCompare(right);

const getHole = (holeId: string): StablefordHole => {
  const hole = STABLEFORD_CONFIG.holes.find(({ id }) => id === holeId);

  if (hole === undefined) {
    throw new Error(`Missing Stableford hole ${holeId}`);
  }

  return hole;
};

test("seeds every handicap, default group, and group name", () => {
  expect(EMPTY_STABLEFORD_STATE).toEqual({
    groupNames: EXPECTED_GROUP_NAMES,
    groups: EXPECTED_GROUPS,
    handicaps: EXPECTED_HANDICAPS,
    locks: {},
    pickups: {},
    scores: {},
  });
});

test("falls back to the seeded state for malformed persisted input", () => {
  expect(parseStablefordState({ groups: { sam: "D" } })).toEqual(
    EMPTY_STABLEFORD_STATE,
  );
});

test.each(INVALID_PERSISTED_SCORES)(
  "falls back for %s in persisted scores",
  (_, invalidScore) => {
    const scoreKey = stablefordScoreKey("sam", "1");

    expect(
      parseStablefordState({ scores: { [scoreKey]: invalidScore } }),
    ).toEqual(EMPTY_STABLEFORD_STATE);
  },
);

test("applies valid remote overrides while preserving missing defaults", () => {
  const scoreKey = stablefordScoreKey("kyle", "2");

  expect(
    parseStablefordState({
      groupNames: {
        A: "Alpha",
        B: "Bravo",
        C: "Charlie",
      },
      groups: { sam: "C" },
      handicaps: { sam: 11 },
      locks: { [scoreKey]: true },
      scores: { [scoreKey]: 5 },
    }),
  ).toEqual({
    groupNames: {
      A: "Alpha",
      B: "Bravo",
      C: "Charlie",
    },
    groups: { ...EXPECTED_GROUPS, sam: "C" },
    handicaps: { ...EXPECTED_HANDICAPS, sam: 11 },
    locks: { [scoreKey]: true },
    pickups: {},
    scores: { [scoreKey]: 5 },
  });
});

test("drops malformed remote entries without discarding valid round data", () => {
  expect(
    parseStablefordState({
      groupNames: { A: "First", B: "", C: "Third" },
      groups: { kyle: "B", sam: "invalid" },
      handicaps: { kyle: 31, sam: 55 },
      locks: { "1": true, "2": "yes" },
      pickups: { "sam::2": true, "sam::3": 1 },
      scores: { "sam::1": 7, "ste::1": 0 },
    }),
  ).toEqual({
    groupNames: { A: "First", B: "Group B", C: "Third" },
    groups: {
      ...EMPTY_STABLEFORD_STATE.groups,
      kyle: "B",
    },
    handicaps: {
      ...EMPTY_STABLEFORD_STATE.handicaps,
      kyle: 31,
    },
    locks: { "1": true },
    pickups: { "sam::2": true },
    scores: { "sam::1": 7 },
  });
});

test.each(INVALID_SCORES)("rejects %s as a gross score", (_, invalidScore) => {
  expect(() =>
    setStablefordScore(EMPTY_STABLEFORD_STATE, "sam", "1", invalidScore),
  ).toThrow(RangeError);
});

test("setting a score clears an existing pickup for the hole", () => {
  const scoreKey = stablefordScoreKey("sam", "1");
  const otherPickupKey = stablefordScoreKey("kyle", "1");
  const state = {
    ...EMPTY_STABLEFORD_STATE,
    pickups: { [otherPickupKey]: true, [scoreKey]: true },
  };

  const updated = setStablefordScore(state, "sam", "1", 7);

  expect(updated.pickups).toEqual({ [otherPickupKey]: true });
  expect(updated.scores).toEqual({ [scoreKey]: 7 });
});

test("setting a pickup clears an existing gross score for the hole", () => {
  const scoreKey = stablefordScoreKey("sam", "1");
  const otherScoreKey = stablefordScoreKey("kyle", "1");
  const state = {
    ...EMPTY_STABLEFORD_STATE,
    scores: { [otherScoreKey]: 4, [scoreKey]: 7 },
  };

  const updated = setStablefordPickup(state, "sam", "1");

  expect(updated.pickups).toEqual({ [scoreKey]: true });
  expect(updated.scores).toEqual({ [otherScoreKey]: 4 });
});

test("clearing a hole returns it to the unplayed state", () => {
  const hole = getHole("1");
  const scoreKey = stablefordScoreKey("sam", hole.id);
  const state = {
    ...EMPTY_STABLEFORD_STATE,
    pickups: { [scoreKey]: true },
    scores: { [scoreKey]: 7 },
  };

  const cleared = clearStablefordHole(state, "sam", hole.id);

  expect(cleared.pickups).toEqual({});
  expect(cleared.scores).toEqual({});
  expect(
    getStablefordHoleResult(
      cleared,
      "sam",
      cleared.handicaps["sam"] ?? 0,
      hole,
    ),
  ).toMatchObject({
    completed: false,
    status: "unplayed",
  });
});

test("accepts integer handicaps at both inclusive range boundaries", () => {
  const withMinimum = setStablefordHandicap(EMPTY_STABLEFORD_STATE, "sam", 0);
  const withMaximum = setStablefordHandicap(withMinimum, "kyle", 54);

  expect(withMaximum.handicaps).toMatchObject({ kyle: 54, sam: 0 });
});

test.each(INVALID_HANDICAPS)(
  "rejects handicaps that are %s",
  (_, invalidHandicap) => {
    expect(() =>
      setStablefordHandicap(EMPTY_STABLEFORD_STATE, "sam", invalidHandicap),
    ).toThrow(RangeError);
  },
);

test("reassigns one player without changing the rest of the groups", () => {
  const reassigned = setStablefordGroup(EMPTY_STABLEFORD_STATE, "sam", "C");

  expect(reassigned.groups).toEqual({ ...EXPECTED_GROUPS, sam: "C" });
  expect(EMPTY_STABLEFORD_STATE.groups["sam"]).toBe("A");
});

test("validates the exact unique 3-by-4 default roster", () => {
  const assignedPlayerIds = Object.keys(EMPTY_STABLEFORD_STATE.groups);
  const configuredPlayerIds = STABLEFORD_CONFIG.players.map(({ id }) => id);

  expect(new Set(assignedPlayerIds).size).toBe(12);
  expect(assignedPlayerIds.toSorted(compareAlphabetically)).toEqual(
    configuredPlayerIds.toSorted(compareAlphabetically),
  );
  expect(validateStablefordGroups(EMPTY_STABLEFORD_STATE.groups)).toEqual({
    counts: { A: 4, B: 4, C: 4 },
    isValid: true,
    unassignedPlayerIds: [],
  });
});

test("flags a missing player assignment for warning display", () => {
  const groups = Object.fromEntries(
    Object.entries(EMPTY_STABLEFORD_STATE.groups).filter(
      ([playerId]) => playerId !== "sam",
    ),
  );

  expect(validateStablefordGroups(groups)).toEqual({
    counts: { A: 3, B: 4, C: 4 },
    isValid: false,
    unassignedPlayerIds: ["sam"],
  });
});

test("flags an imbalanced assignment for warning display", () => {
  const groups = { ...EMPTY_STABLEFORD_STATE.groups, sam: "B" as const };

  expect(validateStablefordGroups(groups)).toEqual({
    counts: { A: 3, B: 5, C: 4 },
    isValid: false,
    unassignedPlayerIds: [],
  });
});
