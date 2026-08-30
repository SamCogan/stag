import { expect, test } from "bun:test";

import { act, renderHook } from "@testing-library/react";

import { scoreKey } from "./scoring";
import { usePubGolfStore } from "./usePubGolfStore";
import { PUB_LOCAL_STORAGE_KEY } from "../../state/eventState";

const INVALID_SCORES = [
  ["zero", 0],
  ["a negative integer", -1],
  ["a fraction", 1.5],
  ["NaN", Number.NaN],
  ["infinity", Number.POSITIVE_INFINITY],
] as const;

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

test("uses the deployed Pub namespace in local-only mode", () => {
  const { result, unmount } = renderHook(() => usePubGolfStore("stag2026"));

  expect(PUB_LOCAL_STORAGE_KEY).toBe("pub-golf-local-state-v2");
  expect(result.current.networkState).toBe("local-only");
  expect(result.current.state).toEqual({
    locks: {},
    penalties: {},
    scores: {},
  });

  unmount();
});

test("writes a positive integer score to state and local storage", async () => {
  const { result, unmount } = renderHook(() => usePubGolfStore("stag2026"));
  const key = scoreKey("a1", "h1");

  await act(async () => {
    await result.current.actions.setScore("a1", "h1", 4);
  });

  expect(result.current.state.scores).toEqual({ [key]: 4 });
  expectStoredValue(PUB_LOCAL_STORAGE_KEY, {
    locks: {},
    penalties: {},
    scores: { [key]: 4 },
  });

  unmount();
});

test.each(INVALID_SCORES)("rejects %s as a score", async (_, score) => {
  const { result, unmount } = renderHook(() => usePubGolfStore("stag2026"));

  const error = await captureActionError(() =>
    result.current.actions.setScore("a1", "h1", score),
  );

  expect(error).toBeInstanceOf(RangeError);
  expect(String(error)).toBe("RangeError: Score must be a positive integer");
  expect(result.current.state.scores).toEqual({});

  unmount();
});

test("toggles a penalty on and back off", async () => {
  const { result, unmount } = renderHook(() => usePubGolfStore("stag2026"));
  const key = scoreKey("a1", "h1");

  await act(async () => {
    await result.current.actions.togglePenalty("a1", "h1", "spill");
  });

  expect(result.current.state.penalties).toEqual({ [key]: { spill: 1 } });

  await act(async () => {
    await result.current.actions.togglePenalty("a1", "h1", "spill");
  });

  expect(result.current.state.penalties).toEqual({ [key]: {} });
  expectStoredValue(PUB_LOCAL_STORAGE_KEY, {
    locks: {},
    penalties: { [key]: {} },
    scores: {},
  });

  unmount();
});

test("toggles a hole lock on and back off", async () => {
  const { result, unmount } = renderHook(() => usePubGolfStore("stag2026"));

  await act(async () => {
    await result.current.actions.toggleLock("h1");
  });
  expect(result.current.state.locks).toEqual({ h1: true });

  await act(async () => {
    await result.current.actions.toggleLock("h1");
  });
  expect(result.current.state.locks).toEqual({ h1: false });
  expectStoredValue(PUB_LOCAL_STORAGE_KEY, {
    locks: { h1: false },
    penalties: {},
    scores: {},
  });

  unmount();
});
