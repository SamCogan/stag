import { expect, test } from "bun:test";

import { act, renderHook } from "@testing-library/react";

import { STABLEFORD_EVENT_CODE, STABLEFORD_LOCAL_STORAGE_KEY } from "./config";
import { stablefordScoreKey } from "./scoring";
import { EMPTY_STABLEFORD_STATE } from "./state";
import { useStablefordStore } from "./useStablefordStore";

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

const readStoredState = (): unknown => {
  const value = globalThis.localStorage.getItem(STABLEFORD_LOCAL_STORAGE_KEY);
  if (value === null) {
    throw new Error("Expected persisted Stableford state");
  }
  return JSON.parse(value) as unknown;
};

test("uses the isolated Stableford namespace and seeded state", () => {
  const { result, unmount } = renderHook(() => useStablefordStore());

  expect(STABLEFORD_EVENT_CODE).toBe("coollattin-stableford");
  expect(result.current.networkState).toBe("local-only");
  expect(result.current.playerActions).toBeUndefined();
  expect(result.current.state).toEqual(EMPTY_STABLEFORD_STATE);

  unmount();
});

test("scopes player score, pickup, and clear actions to that player", async () => {
  const { result, unmount } = renderHook(() => useStablefordStore("sam"));
  const key = stablefordScoreKey("sam", "1");

  await act(async () => {
    await result.current.playerActions?.setScore("1", 7);
  });
  expect(result.current.state.scores).toEqual({ [key]: 7 });

  await act(async () => {
    await result.current.playerActions?.markPickup("1");
  });
  expect(result.current.state.scores).toEqual({});
  expect(result.current.state.pickups).toEqual({ [key]: true });

  await act(async () => {
    await result.current.playerActions?.clearHole("1");
  });
  expect(result.current.state.pickups).toEqual({});
  expect(readStoredState()).toEqual(result.current.state);

  unmount();
});

test("rejects player changes after the organizer locks a hole", async () => {
  const { result, unmount } = renderHook(() => useStablefordStore("sam"));

  await act(async () => {
    await result.current.organizerActions.toggleLock("1");
  });
  const error = await captureActionError(async () => {
    await result.current.playerActions?.setScore("1", 7);
  });

  expect(String(error)).toBe("Error: This hole is locked by the organizer");
  expect(result.current.state.scores).toEqual({});

  unmount();
});

test("supports organizer configuration and score corrections", async () => {
  const { result, unmount } = renderHook(() => useStablefordStore());
  const key = stablefordScoreKey("kyle", "2");

  await act(async () => {
    await result.current.organizerActions.setHandicap("kyle", 30);
    await result.current.organizerActions.setGroup("kyle", "B");
    await result.current.organizerActions.setGroupName("B", "Late Tee");
    await result.current.organizerActions.setScore("kyle", "2", 6);
  });

  expect(result.current.state.handicaps["kyle"]).toBe(30);
  expect(result.current.state.groups["kyle"]).toBe("B");
  expect(result.current.state.groupNames.B).toBe("Late Tee");
  expect(result.current.state.scores[key]).toBe(6);

  unmount();
});

test("rejects a blank group name", async () => {
  const { result, unmount } = renderHook(() => useStablefordStore());

  const error = await captureActionError(() =>
    result.current.organizerActions.setGroupName("A", "   "),
  );

  expect(String(error)).toBe("Error: Group name cannot be blank");
  expect(result.current.state.groupNames.A).toBe("Group A");

  unmount();
});

test("resets only the Stableford state", async () => {
  const { result, unmount } = renderHook(() => useStablefordStore());

  await act(async () => {
    await result.current.organizerActions.setScore("sam", "1", 7);
    await result.current.organizerActions.setHandicap("sam", 12);
    await result.current.organizerActions.setGroup("sam", "C");
    await result.current.organizerActions.toggleLock("1");
    await result.current.organizerActions.resetEvent();
  });

  expect(result.current.state).toEqual(EMPTY_STABLEFORD_STATE);
  expect(readStoredState()).toEqual(EMPTY_STABLEFORD_STATE);

  unmount();
});
