import { useCallback, useMemo } from "react";

import { scoreKey } from "./scoring";
import { useEventState, type NetworkState } from "../../hooks/useEventState";
import {
  EMPTY_PUB_STATE,
  parsePubState,
  PUB_LOCAL_STORAGE_KEY,
  type PubState,
} from "../../state/eventState";

export interface PubGolfActions {
  setScore(playerId: string, holeId: string, score: number): Promise<void>;
  toggleLock(holeId: string): Promise<void>;
  togglePenalty(
    playerId: string,
    holeId: string,
    penaltyId: string,
  ): Promise<void>;
}

interface PubGolfStore {
  actions: PubGolfActions;
  networkState: NetworkState;
  state: PubState;
}

export const usePubGolfStore = (eventCode: string): PubGolfStore => {
  const { networkState, state, updateState } = useEventState({
    defaultState: EMPTY_PUB_STATE,
    eventCode,
    localStorageKey: PUB_LOCAL_STORAGE_KEY,
    parseState: parsePubState,
  });

  const setScore = useCallback(
    async (playerId: string, holeId: string, score: number): Promise<void> => {
      if (!Number.isInteger(score) || score < 1) {
        throw new RangeError("Score must be a positive integer");
      }
      const key = scoreKey(playerId, holeId);
      await updateState({ [`scores/${key}`]: score }, (previous) => ({
        ...previous,
        scores: { ...previous.scores, [key]: score },
      }));
    },
    [updateState],
  );

  const togglePenalty = useCallback(
    async (
      playerId: string,
      holeId: string,
      penaltyId: string,
    ): Promise<void> => {
      const key = scoreKey(playerId, holeId);
      const current = state.penalties[key] ?? {};
      const isActive = (current[penaltyId] ?? 0) > 0;
      const nextCounts = Object.fromEntries(
        Object.entries(current).filter(([id]) => id !== penaltyId),
      );
      if (!isActive) {
        nextCounts[penaltyId] = 1;
      }

      await updateState(
        { [`penalties/${key}/${penaltyId}`]: isActive ? null : 1 },
        (previous) => ({
          ...previous,
          penalties: {
            ...previous.penalties,
            [key]: nextCounts,
          },
        }),
      );
    },
    [state.penalties, updateState],
  );

  const toggleLock = useCallback(
    async (holeId: string): Promise<void> => {
      const isLocked = state.locks[holeId] !== true;
      await updateState({ [`locks/${holeId}`]: isLocked }, (previous) => ({
        ...previous,
        locks: { ...previous.locks, [holeId]: isLocked },
      }));
    },
    [state.locks, updateState],
  );

  const actions = useMemo(
    () => ({ setScore, toggleLock, togglePenalty }),
    [setScore, toggleLock, togglePenalty],
  );

  return { actions, networkState, state };
};
