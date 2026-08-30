import { expect, test } from "bun:test";

import { parsePubState, PUB_LOCAL_STORAGE_KEY } from "./eventState";

const EMPTY_STATE = {
  locks: {},
  penalties: {},
  scores: {},
};

const INVALID_SCORE_VALUES = [
  ["a malformed string", "3"],
  ["a non-positive zero", 0],
  ["a non-positive negative", -1],
  ["a non-integer fractional", 1.5],
] as const satisfies readonly (readonly [string, unknown])[];

test("preserves the deployed Pub local-storage key", () => {
  expect(PUB_LOCAL_STORAGE_KEY).toBe("pub-golf-local-state-v2");
});

test("normalizes the current Pub state shape", () => {
  expect(
    parsePubState({
      locks: { a1: true },
      penalties: { a1: { spill: 2 } },
      scores: { a1: 4 },
      stale: "discarded",
    }),
  ).toEqual({
    locks: { a1: true },
    penalties: { a1: { spill: 2 } },
    scores: { a1: 4 },
  });
});

test("defaults omitted locks and penalties to empty records", () => {
  expect(parsePubState({ scores: { a1: 4 } })).toEqual({
    locks: {},
    penalties: {},
    scores: { a1: 4 },
  });
});

test("migrates a legacy score map into the current state shape", () => {
  expect(parsePubState({ a1: 4, b2: 2 })).toEqual({
    locks: {},
    penalties: {},
    scores: { a1: 4, b2: 2 },
  });
});

test.each(INVALID_SCORE_VALUES)(
  "rejects %s score value in the current state shape",
  (_, value) => {
    expect(parsePubState({ scores: { a1: value } })).toEqual(EMPTY_STATE);
  },
);

test.each(INVALID_SCORE_VALUES)(
  "rejects %s score value in a legacy score map",
  (_, value) => {
    expect(parsePubState({ a1: value })).toEqual(EMPTY_STATE);
  },
);
