import { expect, test } from "bun:test";

import { getHandicapStrokes } from "./handicap";

test("allocates no strokes to a zero handicap", () => {
  expect(getHandicapStrokes(0, 1)).toBe(0);
  expect(getHandicapStrokes(0, 18)).toBe(0);
});

test("allocates a below-18 handicap through its matching stroke index", () => {
  expect(getHandicapStrokes(17, 17)).toBe(1);
  expect(getHandicapStrokes(17, 18)).toBe(0);
});

test("allocates one stroke on every hole at handicap 18", () => {
  expect(getHandicapStrokes(18, 1)).toBe(1);
  expect(getHandicapStrokes(18, 18)).toBe(1);
});

test("allocates the additional stroke by stroke index above handicap 18", () => {
  expect(getHandicapStrokes(19, 1)).toBe(2);
  expect(getHandicapStrokes(19, 2)).toBe(1);
  expect(getHandicapStrokes(19, 18)).toBe(1);
});

test("respects stroke-index boundaries at high handicaps", () => {
  expect(getHandicapStrokes(37, 1)).toBe(3);
  expect(getHandicapStrokes(37, 2)).toBe(2);
  expect(getHandicapStrokes(53, 17)).toBe(3);
  expect(getHandicapStrokes(53, 18)).toBe(2);
  expect(getHandicapStrokes(54, 1)).toBe(3);
  expect(getHandicapStrokes(54, 18)).toBe(3);
});
