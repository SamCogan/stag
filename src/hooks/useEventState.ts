import { useCallback, useEffect, useMemo } from "react";
import useLocalStorageState from "use-local-storage-state";

import { createRemoteStore } from "../firebaseStore";

import type { Dispatch, SetStateAction } from "react";

export type NetworkState = "connected" | "local-only";

interface EventStateOptions<State> {
  defaultState: State;
  eventCode: string;
  localStorageKey: string;
  parseState: (input: unknown) => State;
}

export interface EventStateStore<State> {
  networkState: NetworkState;
  replaceState: Dispatch<SetStateAction<State>>;
  state: State;
  updateState(
    patch: Readonly<Record<string, unknown>>,
    updater: (previous: State) => State,
  ): Promise<void>;
}

export const useEventState = <State>({
  defaultState,
  eventCode,
  localStorageKey,
  parseState,
}: EventStateOptions<State>): EventStateStore<State> => {
  const [state, replaceState] = useLocalStorageState<State>(localStorageKey, {
    defaultValue: defaultState,
  });
  const remote = useMemo(
    () => createRemoteStore(eventCode, parseState),
    [eventCode, parseState],
  );

  useEffect(() => {
    if (remote === null) {
      return;
    }

    return remote.subscribe(replaceState);
  }, [remote, replaceState]);

  const updateState = useCallback(
    async (
      patch: Readonly<Record<string, unknown>>,
      updater: (previous: State) => State,
    ): Promise<void> => {
      replaceState(updater);
      if (remote !== null) {
        await remote.update({ ...patch });
      }
    },
    [remote, replaceState],
  );

  return {
    networkState: remote === null ? "local-only" : "connected",
    replaceState,
    state,
    updateState,
  };
};
