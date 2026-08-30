import { expect, test } from "bun:test";

import { act, renderHook } from "@testing-library/react";

import { strokeScoreKey } from "./scoring";
import { useStrokeStore } from "./useStrokeStore";
import { STROKE_LOCAL_STORAGE_KEY } from "../../state/golfState";

const INVALID_SCORES = [
  ["zero", 0],
  ["a negative integer", -1],
  ["a fraction", 1.5],
  ["NaN", Number.NaN],
  ["infinity", Number.POSITIVE_INFINITY],
] as const;

const INVALID_HANDICAPS = [
  ["below the minimum", -1],
  ["above the maximum", 55],
  ["a fraction", 1.5],
  ["NaN", Number.NaN],
  ["infinity", Number.POSITIVE_INFINITY],
] as const;

const HANDICAP_BOUNDARIES = [[0], [54]] as const;

const expectStoredValue = (key: string, expected: unknown): void => {
  const value = globalThis.localStorage.getItem(key);
  if (value === null) {
    throw new Error(`Expected local-storage value for ${key}`);
  }
  expect(JSON.parse(value) as unknown).toEqual(expected);
};

const captureActionError = async (
  action: () => Promise<void>,
): Promise<unknown> => {
  try {
    await action();
  } catch (error: unknown) {
    return error;
  }
  throw new Error("Expected action to reject");
};

test("uses the deployed Stroke namespace in local-only mode", () => {
  const { result, unmount } = renderHook(useStrokeStore);

  expect(STROKE_LOCAL_STORAGE_KEY).toBe("golf-stroke-state-v1");
  expect(result.current.networkState).toBe("local-only");
  expect(result.current.state).toEqual({
    handicaps: {},
    locks: {},
    scores: {},
  });

  unmount();
});

test("writes a positive integer score to state and local storage", async () => {
  const { result, unmount } = renderHook(useStrokeStore);
  const key = strokeScoreKey("a1", "v1");

  await act(async () => {
    await result.current.actions.setScore("a1", "v1", 4);
  });

  expect(result.current.state.scores).toEqual({ [key]: 4 });
  expectStoredValue(STROKE_LOCAL_STORAGE_KEY, {
    handicaps: {},
    locks: {},
    scores: { [key]: 4 },
  });

  unmount();
});

test.each(INVALID_SCORES)("rejects %s as a score", async (_, score) => {
  const { result, unmount } = renderHook(useStrokeStore);

  const error = await captureActionError(() =>
    result.current.actions.setScore("a1", "v1", score),
  );

  expect(error).toBeInstanceOf(RangeError);
  expect(String(error)).toBe("RangeError: Score must be a positive integer");
  expect(result.current.state.scores).toEqual({});

  unmount();
});

test.each(HANDICAP_BOUNDARIES)(
  "writes the inclusive handicap boundary %i",
  async (handicap) => {
    const { result, unmount } = renderHook(useStrokeStore);

    await act(async () => {
      await result.current.actions.setHandicap("a1", handicap);
    });

    expect(result.current.state.handicaps).toEqual({ a1: handicap });
    expectStoredValue(STROKE_LOCAL_STORAGE_KEY, {
      handicaps: { a1: handicap },
      locks: {},
      scores: {},
    });

    unmount();
  },
);

test.each(INVALID_HANDICAPS)("rejects a handicap %s", async (_, handicap) => {
  const { result, unmount } = renderHook(useStrokeStore);

  const error = await captureActionError(() =>
    result.current.actions.setHandicap("a1", handicap),
  );

  expect(error).toBeInstanceOf(RangeError);
  expect(String(error)).toBe(
    "RangeError: Handicap must be an integer from 0 through 54",
  );
  expect(result.current.state.handicaps).toEqual({});

  unmount();
});

test("toggles a hole lock on and back off", async () => {
  const { result, unmount } = renderHook(useStrokeStore);

  await act(async () => {
    await result.current.actions.toggleLock("v1");
  });
  expect(result.current.state.locks).toEqual({ v1: true });

  await act(async () => {
    await result.current.actions.toggleLock("v1");
  });
  expect(result.current.state.locks).toEqual({ v1: false });
  expectStoredValue(STROKE_LOCAL_STORAGE_KEY, {
    handicaps: {},
    locks: { v1: false },
    scores: {},
  });

  unmount();
});

test("resets scores and locks while preserving handicaps", async () => {
  const key = strokeScoreKey("a1", "v1");
  globalThis.localStorage.setItem(
    STROKE_LOCAL_STORAGE_KEY,
    JSON.stringify({
      handicaps: { a1: 18 },
      locks: { v1: true },
      scores: { [key]: 4 },
    }),
  );
  const { result, unmount } = renderHook(useStrokeStore);

  await act(async () => {
    await result.current.actions.resetScores();
  });

  expect(result.current.state).toEqual({
    handicaps: { a1: 18 },
    locks: {},
    scores: {},
  });
  expectStoredValue(STROKE_LOCAL_STORAGE_KEY, {
    handicaps: { a1: 18 },
    locks: {},
    scores: {},
  });

  unmount();
});
