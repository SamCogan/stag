import { useCallback, useMemo } from "react";

import {
  STABLEFORD_EVENT_CODE,
  STABLEFORD_LOCAL_STORAGE_KEY,
  type StablefordGroupId,
} from "./config";
import { stablefordScoreKey } from "./scoring";
import {
  clearStablefordHole,
  EMPTY_STABLEFORD_STATE,
  parseStablefordState,
  setStablefordGroup,
  setStablefordHandicap,
  setStablefordPickup,
  setStablefordScore,
  type StablefordState,
} from "./state";
import {
  useEventState,
  type EventStateStore,
  type NetworkState,
} from "../../hooks/useEventState";

export interface PlayerScoreActions {
  clearHole(holeId: string): Promise<void>;
  markPickup(holeId: string): Promise<void>;
  setScore(holeId: string, gross: number): Promise<void>;
}

export interface OrganizerActions {
  clearHole(playerId: string, holeId: string): Promise<void>;
  markPickup(playerId: string, holeId: string): Promise<void>;
  resetEvent(): Promise<void>;
  setGroup(playerId: string, groupId: StablefordGroupId): Promise<void>;
  setGroupName(groupId: StablefordGroupId, name: string): Promise<void>;
  setHandicap(playerId: string, handicap: number): Promise<void>;
  setScore(playerId: string, holeId: string, gross: number): Promise<void>;
  toggleLock(holeId: string): Promise<void>;
}

interface StablefordStore {
  networkState: NetworkState;
  organizerActions: OrganizerActions;
  playerActions?: PlayerScoreActions;
  state: StablefordState;
}

type UpdateState = EventStateStore<StablefordState>["updateState"];

const useStablefordMutations = (updateState: UpdateState) => {
  const updateScore = useCallback(
    async (playerId: string, holeId: string, gross: number): Promise<void> => {
      const key = stablefordScoreKey(playerId, holeId);
      await updateState(
        { [`pickups/${key}`]: null, [`scores/${key}`]: gross },
        (previous) => setStablefordScore(previous, playerId, holeId, gross),
      );
    },
    [updateState],
  );

  const markPickup = useCallback(
    async (playerId: string, holeId: string): Promise<void> => {
      const key = stablefordScoreKey(playerId, holeId);
      await updateState(
        { [`pickups/${key}`]: true, [`scores/${key}`]: null },
        (previous) => setStablefordPickup(previous, playerId, holeId),
      );
    },
    [updateState],
  );

  const clearHole = useCallback(
    async (playerId: string, holeId: string): Promise<void> => {
      const key = stablefordScoreKey(playerId, holeId);
      await updateState(
        { [`pickups/${key}`]: null, [`scores/${key}`]: null },
        (previous) => clearStablefordHole(previous, playerId, holeId),
      );
    },
    [updateState],
  );

  return useMemo(
    () => ({ clearHole, markPickup, updateScore }),
    [clearHole, markPickup, updateScore],
  );
};

type StablefordMutations = ReturnType<typeof useStablefordMutations>;

const usePlayerActions = (
  authenticatedPlayerId: string | undefined,
  state: StablefordState,
  mutations: StablefordMutations,
): PlayerScoreActions | undefined =>
  useMemo<PlayerScoreActions | undefined>(() => {
    if (authenticatedPlayerId === undefined) {
      return;
    }

    const assertUnlocked = (holeId: string): void => {
      if (state.locks[holeId] === true) {
        throw new Error("This hole is locked by the organizer");
      }
    };

    return {
      async clearHole(holeId) {
        assertUnlocked(holeId);
        await mutations.clearHole(authenticatedPlayerId, holeId);
      },
      async markPickup(holeId) {
        assertUnlocked(holeId);
        await mutations.markPickup(authenticatedPlayerId, holeId);
      },
      async setScore(holeId, gross) {
        assertUnlocked(holeId);
        await mutations.updateScore(authenticatedPlayerId, holeId, gross);
      },
    };
  }, [authenticatedPlayerId, mutations, state.locks]);

const useOrganizerActions = (
  state: StablefordState,
  updateState: UpdateState,
  mutations: StablefordMutations,
): OrganizerActions =>
  useMemo<OrganizerActions>(
    () => ({
      clearHole: mutations.clearHole,
      markPickup: mutations.markPickup,
      async resetEvent() {
        await updateState(
          {
            groupNames: EMPTY_STABLEFORD_STATE.groupNames,
            groups: EMPTY_STABLEFORD_STATE.groups,
            handicaps: EMPTY_STABLEFORD_STATE.handicaps,
            locks: null,
            pickups: null,
            scores: null,
          },
          () => EMPTY_STABLEFORD_STATE,
        );
      },
      async setGroup(playerId, groupId) {
        await updateState({ [`groups/${playerId}`]: groupId }, (previous) =>
          setStablefordGroup(previous, playerId, groupId),
        );
      },
      async setGroupName(groupId, name) {
        const normalizedName = name.trim();
        if (normalizedName.length === 0) {
          throw new Error("Group name cannot be blank");
        }
        await updateState(
          { [`groupNames/${groupId}`]: normalizedName },
          (previous) => ({
            ...previous,
            groupNames: {
              ...previous.groupNames,
              [groupId]: normalizedName,
            },
          }),
        );
      },
      async setHandicap(playerId, handicap) {
        await updateState({ [`handicaps/${playerId}`]: handicap }, (previous) =>
          setStablefordHandicap(previous, playerId, handicap),
        );
      },
      setScore: mutations.updateScore,
      async toggleLock(holeId) {
        const isLocked = state.locks[holeId] !== true;
        await updateState({ [`locks/${holeId}`]: isLocked }, (previous) => ({
          ...previous,
          locks: { ...previous.locks, [holeId]: isLocked },
        }));
      },
    }),
    [mutations, state.locks, updateState],
  );

export const useStablefordStore = (
  authenticatedPlayerId?: string,
): StablefordStore => {
  const { networkState, state, updateState } = useEventState({
    defaultState: EMPTY_STABLEFORD_STATE,
    eventCode: STABLEFORD_EVENT_CODE,
    localStorageKey: STABLEFORD_LOCAL_STORAGE_KEY,
    parseState: parseStablefordState,
  });
  const mutations = useStablefordMutations(updateState);
  const organizerActions = useOrganizerActions(state, updateState, mutations);
  const playerActions = usePlayerActions(
    authenticatedPlayerId,
    state,
    mutations,
  );

  return playerActions === undefined
    ? { networkState, organizerActions, state }
    : { networkState, organizerActions, playerActions, state };
};
