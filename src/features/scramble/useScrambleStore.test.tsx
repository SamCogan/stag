import { expect, test } from "bun:test";

import { act, renderHook } from "@testing-library/react";

import { scrambleScoreKey } from "./scoring";
import { useScrambleStore } from "./useScrambleStore";
import {
  SCRAMBLE_LOCAL_STORAGE_KEY,
  TEAM_NAMES_STORAGE_KEY,
  VILA_SOL_LOOP_STORAGE_KEY,
} from "../../state/golfState";

const INVALID_SCORES = [
  ["zero", 0],
  ["a negative integer", -1],
  ["a fraction", 1.5],
  ["NaN", Number.NaN],
  ["infinity", Number.POSITIVE_INFINITY],
] as const;

const BLANK_TEAM_NAMES = [
  ["empty", ""],
  ["one space", " "],
  ["mixed whitespace", " \t "],
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

test("uses the deployed Scramble namespaces in local-only mode", () => {
  const { result, unmount } = renderHook(useScrambleStore);

  expect(SCRAMBLE_LOCAL_STORAGE_KEY).toBe("golf-scramble-state-v1");
  expect(VILA_SOL_LOOP_STORAGE_KEY).toBe("golf-loops-v1");
  expect(TEAM_NAMES_STORAGE_KEY).toBe("team-names-v1");
  expect(result.current.networkState).toBe("local-only");

  unmount();
});

test("writes a positive integer score to state and local storage", async () => {
  const { result, unmount } = renderHook(useScrambleStore);
  const key = scrambleScoreKey("A", "v1");

  await act(async () => {
    await result.current.actions.setScore("A", "v1", 4);
  });

  expect(result.current.state.scores).toEqual({ [key]: 4 });
  expectStoredValue(SCRAMBLE_LOCAL_STORAGE_KEY, {
    drives: {},
    locks: {},
    scores: { [key]: 4 },
  });

  unmount();
});

test.each(INVALID_SCORES)("rejects %s as a score", async (_, score) => {
  const { result, unmount } = renderHook(useScrambleStore);

  const error = await captureActionError(() =>
    result.current.actions.setScore("A", "v1", score),
  );

  expect(error).toBeInstanceOf(RangeError);
  expect(String(error)).toBe("RangeError: Score must be a positive integer");
  expect(result.current.state.scores).toEqual({});

  unmount();
});

test("selects and deselects a drive", async () => {
  const { result, unmount } = renderHook(useScrambleStore);
  const key = scrambleScoreKey("A", "v1");

  await act(async () => {
    await result.current.actions.setDrive("A", "v1", "a1");
  });
  expect(result.current.state.drives).toEqual({ [key]: "a1" });

  await act(async () => {
    await result.current.actions.setDrive("A", "v1", "a1");
  });
  expect(result.current.state.drives).toEqual({});
  expectStoredValue(SCRAMBLE_LOCAL_STORAGE_KEY, {
    drives: {},
    locks: {},
    scores: {},
  });

  unmount();
});

test("toggles a hole lock on and back off", async () => {
  const { result, unmount } = renderHook(useScrambleStore);

  await act(async () => {
    await result.current.actions.toggleLock("v1");
  });
  expect(result.current.state.locks).toEqual({ v1: true });

  await act(async () => {
    await result.current.actions.toggleLock("v1");
  });
  expect(result.current.state.locks).toEqual({ v1: false });
  expectStoredValue(SCRAMBLE_LOCAL_STORAGE_KEY, {
    drives: {},
    locks: { v1: false },
    scores: {},
  });

  unmount();
});

test("changes and persists the selected loop combination", async () => {
  const { result, unmount } = renderHook(useScrambleStore);

  await act(async () => {
    await result.current.actions.setLoopCombination("Out+In");
  });

  expect(result.current.loopCombination).toBe("Out+In");
  expectStoredValue(VILA_SOL_LOOP_STORAGE_KEY, { loopCombo: "Out+In" });

  unmount();
});

test("trims and persists a team name", async () => {
  const { result, unmount } = renderHook(useScrambleStore);
  const originalNames = result.current.teamNames;

  await act(async () => {
    await result.current.actions.setTeamName("A", "  The Alphas  ");
  });

  expect(result.current.teamNames).toEqual({
    ...originalNames,
    A: "The Alphas",
  });
  expectStoredValue(TEAM_NAMES_STORAGE_KEY, {
    teamNames: { ...originalNames, A: "The Alphas" },
  });

  unmount();
});

test.each(BLANK_TEAM_NAMES)(
  "rejects a blank team name containing %s",
  async (_, name) => {
    const { result, unmount } = renderHook(useScrambleStore);
    const originalNames = result.current.teamNames;

    const error = await captureActionError(() =>
      result.current.actions.setTeamName("A", name),
    );

    expect(error).toBeInstanceOf(Error);
    expect(String(error)).toBe("Error: Team name cannot be blank");
    expect(result.current.teamNames).toEqual(originalNames);

    unmount();
  },
);

test("resets Scramble data without changing loop or team names", async () => {
  const key = scrambleScoreKey("A", "v1");
  globalThis.localStorage.setItem(
    SCRAMBLE_LOCAL_STORAGE_KEY,
    JSON.stringify({
      drives: { [key]: "a1" },
      locks: { v1: true },
      scores: { [key]: 4 },
    }),
  );
  globalThis.localStorage.setItem(
    VILA_SOL_LOOP_STORAGE_KEY,
    JSON.stringify({ loopCombo: "Out+In" }),
  );
  globalThis.localStorage.setItem(
    TEAM_NAMES_STORAGE_KEY,
    JSON.stringify({
      teamNames: { A: "Alphas", B: "Bravos", C: "Charlies" },
    }),
  );
  const { result, unmount } = renderHook(useScrambleStore);

  await act(async () => {
    await result.current.actions.resetScores();
  });

  expect(result.current.state).toEqual({ drives: {}, locks: {}, scores: {} });
  expect(result.current.loopCombination).toBe("Out+In");
  expect(result.current.teamNames).toEqual({
    A: "Alphas",
    B: "Bravos",
    C: "Charlies",
  });
  expectStoredValue(SCRAMBLE_LOCAL_STORAGE_KEY, {
    drives: {},
    locks: {},
    scores: {},
  });

  unmount();
});
