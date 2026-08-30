import { expect, test } from "bun:test";

import {
  parseScrambleState,
  parseStagConfig,
  parseStrokeState,
  parseVilaSolConfig,
} from "./golfState";
import { DEFAULT_VILA_SOL_LOOP_COMBINATION } from "../config/vilaSol";

test("normalizes a valid Scramble state", () => {
  expect(
    parseScrambleState({
      drives: { "A::v1": "a1" },
      locks: { v1: true },
      scores: { "A::v1": 3 },
      stale: "discarded",
    }),
  ).toEqual({
    drives: { "A::v1": "a1" },
    locks: { v1: true },
    scores: { "A::v1": 3 },
  });
});

test("falls back to an empty Scramble state for invalid input", () => {
  expect(
    parseScrambleState({
      drives: { "A::v1": "" },
      locks: { v1: true },
      scores: { "A::v1": 3 },
    }),
  ).toEqual({ drives: {}, locks: {}, scores: {} });
});

test("normalizes a valid Stroke state", () => {
  expect(
    parseStrokeState({
      handicaps: { a1: 0, b1: 54 },
      locks: { v1: false },
      scores: { "a1::v1": 4 },
      stale: "discarded",
    }),
  ).toEqual({
    handicaps: { a1: 0, b1: 54 },
    locks: { v1: false },
    scores: { "a1::v1": 4 },
  });
});

test("falls back to an empty Stroke state for invalid input", () => {
  expect(
    parseStrokeState({
      handicaps: { a1: 55 },
      locks: {},
      scores: {},
    }),
  ).toEqual({ handicaps: {}, locks: {}, scores: {} });
});

test("migrates a legacy raw loop combination", () => {
  expect(parseVilaSolConfig("Out+In")).toEqual({ loopCombo: "Out+In" });
});

test("normalizes the current loop configuration", () => {
  expect(parseVilaSolConfig({ loopCombo: "Mid+In" })).toEqual({
    loopCombo: "Mid+In",
  });
});

test("falls back to the default loop for invalid configuration", () => {
  expect(parseVilaSolConfig({ loopCombo: "Front+Back" })).toEqual({
    loopCombo: DEFAULT_VILA_SOL_LOOP_COMBINATION,
  });
});

test("normalizes valid Stag team configuration", () => {
  expect(
    parseStagConfig({
      teamNames: { A: "Alphas", B: "Bravos", C: "Charlies" },
      stale: "discarded",
    }),
  ).toEqual({
    teamNames: { A: "Alphas", B: "Bravos", C: "Charlies" },
  });
});

test("migrates legacy locally stored team names", () => {
  expect(parseStagConfig({ A: "Alpha", B: "Bravo", C: "Charlie" })).toEqual({
    teamNames: { A: "Alpha", B: "Bravo", C: "Charlie" },
  });
});

test("falls back to empty Stag configuration for invalid team names", () => {
  expect(
    parseStagConfig({
      teamNames: { A: "Alphas", B: "Bravos", C: "" },
    }),
  ).toEqual({});
});
