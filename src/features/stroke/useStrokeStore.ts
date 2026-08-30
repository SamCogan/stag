import { useCallback, useMemo } from "react";

import { strokeScoreKey } from "./scoring";
import { useEventState, type NetworkState } from "../../hooks/useEventState";
import {
  EMPTY_STROKE_STATE,
  parseStrokeState,
  STROKE_EVENT_CODE,
  STROKE_LOCAL_STORAGE_KEY,
  type StrokeState,
} from "../../state/golfState";

export interface StrokeActions {
  resetScores(): Promise<void>;
  setHandicap(playerId: string, handicap: number): Promise<void>;
  setScore(playerId: string, holeId: string, score: number): Promise<void>;
  toggleLock(holeId: string): Promise<void>;
}

interface StrokeStore {
  actions: StrokeActions;
  networkState: NetworkState;
  state: StrokeState;
}

export const useStrokeStore = (): StrokeStore => {
  const { networkState, state, updateState } = useEventState({
    defaultState: EMPTY_STROKE_STATE,
    eventCode: STROKE_EVENT_CODE,
    localStorageKey: STROKE_LOCAL_STORAGE_KEY,
    parseState: parseStrokeState,
  });

  const setScore = useCallback(
    async (playerId: string, holeId: string, score: number): Promise<void> => {
      if (!Number.isInteger(score) || score < 1) {
        throw new RangeError("Score must be a positive integer");
      }
      const key = strokeScoreKey(playerId, holeId);
      await updateState({ [`scores/${key}`]: score }, (previous) => ({
        ...previous,
        scores: { ...previous.scores, [key]: score },
      }));
    },
    [updateState],
  );

  const actions = useMemo<StrokeActions>(
    () => ({
      async resetScores() {
        await updateState({ locks: null, scores: null }, (previous) => ({
          ...previous,
          locks: {},
          scores: {},
        }));
      },
      async setHandicap(playerId, handicap) {
        if (!Number.isInteger(handicap) || handicap < 0 || handicap > 54) {
          throw new RangeError("Handicap must be an integer from 0 through 54");
        }
        await updateState(
          { [`handicaps/${playerId}`]: handicap },
          (previous) => ({
            ...previous,
            handicaps: { ...previous.handicaps, [playerId]: handicap },
          }),
        );
      },
      setScore,
      async toggleLock(holeId) {
        const isLocked = state.locks[holeId] !== true;
        await updateState({ [`locks/${holeId}`]: isLocked }, (previous) => ({
          ...previous,
          locks: { ...previous.locks, [holeId]: isLocked },
        }));
      },
    }),
    [setScore, state.locks, updateState],
  );

  return { actions, networkState, state };
};
