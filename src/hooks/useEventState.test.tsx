import { expect, mock, test } from "bun:test";

import { act, renderHook } from "@testing-library/react";

import { useEventState } from "./useEventState";

interface CountState {
  count: number;
}

const DEFAULT_STATE: CountState = { count: 0 };
const LOCAL_STORAGE_KEY = "use-event-state-test";

const parseCountState = (input: unknown): CountState => {
  if (
    typeof input === "object" &&
    input !== null &&
    "count" in input &&
    typeof input.count === "number"
  ) {
    return { count: input.count };
  }

  return DEFAULT_STATE;
};

const renderCountState = (
  parseState: (input: unknown) => CountState = parseCountState,
) =>
  renderHook(() =>
    useEventState({
      defaultState: DEFAULT_STATE,
      eventCode: "test-event",
      localStorageKey: LOCAL_STORAGE_KEY,
      parseState,
    }),
  );

test("returns the default state in local-only mode", () => {
  const { result, unmount } = renderCountState();

  expect(result.current.networkState).toBe("local-only");
  expect(result.current.state).toEqual(DEFAULT_STATE);

  unmount();
});

test("parses JSON local storage through the provided parser", () => {
  globalThis.localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({ count: 4 }),
  );
  const parseState = mock((input: unknown) => parseCountState(input));

  const { result, unmount } = renderCountState(parseState);

  expect(parseState).toHaveBeenCalledWith({ count: 4 });
  expect(result.current.state).toEqual({ count: 4 });

  unmount();
});

test("falls back to parsing a raw legacy local-storage value", () => {
  globalThis.localStorage.setItem(LOCAL_STORAGE_KEY, "legacy-count");
  const parseState = mock((input: unknown): CountState => {
    return input === "legacy-count" ? { count: 7 } : parseCountState(input);
  });

  const { result, unmount } = renderCountState(parseState);

  expect(parseState).toHaveBeenCalledWith("legacy-count");
  expect(result.current.state).toEqual({ count: 7 });

  unmount();
});

test("optimistically updates state and persists it locally", async () => {
  const { result, unmount } = renderCountState();
  const updater = mock((previous: CountState): CountState => ({
    count: previous.count + 1,
  }));

  await act(async () => {
    await result.current.updateState({ count: 1 }, updater);
  });

  expect(updater).toHaveBeenCalledWith(DEFAULT_STATE);
  expect(result.current.state).toEqual({ count: 1 });
  expect(globalThis.localStorage.getItem(LOCAL_STORAGE_KEY)).toBe(
    JSON.stringify({ count: 1 }),
  );

  unmount();
});

test("replaces state and persists the replacement locally", () => {
  const { result, unmount } = renderCountState();

  act(() => {
    result.current.replaceState({ count: 9 });
  });

  expect(result.current.state).toEqual({ count: 9 });
  expect(globalThis.localStorage.getItem(LOCAL_STORAGE_KEY)).toBe(
    JSON.stringify({ count: 9 }),
  );

  unmount();
});
