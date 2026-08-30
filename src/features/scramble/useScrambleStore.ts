import { useCallback, useMemo } from "react";

import { scrambleScoreKey } from "./scoring";
import { PUB_EVENT } from "../../config/pubGolf";
import {
  DEFAULT_VILA_SOL_LOOP_COMBINATION,
  type VilaSolLoopCombination,
} from "../../config/vilaSol";
import { useEventState, type NetworkState } from "../../hooks/useEventState";
import {
  EMPTY_SCRAMBLE_STATE,
  parseScrambleState,
  parseStagConfig,
  parseVilaSolConfig,
  SCRAMBLE_EVENT_CODE,
  SCRAMBLE_LOCAL_STORAGE_KEY,
  STAG_CONFIG_EVENT_CODE,
  TEAM_NAMES_STORAGE_KEY,
  VILA_SOL_CONFIG_EVENT_CODE,
  VILA_SOL_LOOP_STORAGE_KEY,
  type ScrambleState,
  type TeamNames,
} from "../../state/golfState";

import type { TeamId } from "../../config/eventSchemas";

const DEFAULT_TEAM_NAMES: TeamNames = {
  A: PUB_EVENT.teams.A.label,
  B: PUB_EVENT.teams.B.label,
  C: PUB_EVENT.teams.C.label,
};

export interface ScrambleActions {
  resetScores(): Promise<void>;
  setDrive(teamId: TeamId, holeId: string, playerId: string): Promise<void>;
  setLoopCombination(combination: VilaSolLoopCombination): Promise<void>;
  setScore(teamId: TeamId, holeId: string, score: number): Promise<void>;
  setTeamName(teamId: TeamId, name: string): Promise<void>;
  toggleLock(holeId: string): Promise<void>;
}

interface ScrambleStore {
  actions: ScrambleActions;
  loopCombination: VilaSolLoopCombination;
  networkState: NetworkState;
  state: ScrambleState;
  teamNames: TeamNames;
}

const useScrambleEventStores = () => {
  const scrambleStore = useEventState({
    defaultState: EMPTY_SCRAMBLE_STATE,
    eventCode: SCRAMBLE_EVENT_CODE,
    localStorageKey: SCRAMBLE_LOCAL_STORAGE_KEY,
    parseState: parseScrambleState,
  });
  const loopStore = useEventState({
    defaultState: { loopCombo: DEFAULT_VILA_SOL_LOOP_COMBINATION },
    eventCode: VILA_SOL_CONFIG_EVENT_CODE,
    localStorageKey: VILA_SOL_LOOP_STORAGE_KEY,
    parseState: parseVilaSolConfig,
  });
  const nameStore = useEventState({
    defaultState: { teamNames: DEFAULT_TEAM_NAMES },
    eventCode: STAG_CONFIG_EVENT_CODE,
    localStorageKey: TEAM_NAMES_STORAGE_KEY,
    parseState: parseStagConfig,
  });
  return { loopStore, nameStore, scrambleStore };
};

const updateDriveState = (
  previous: ScrambleState,
  key: string,
  playerId: string | null,
): ScrambleState => {
  const drives = Object.fromEntries(
    Object.entries(previous.drives).filter(([driveKey]) => driveKey !== key),
  );
  return {
    ...previous,
    drives: playerId === null ? drives : { ...drives, [key]: playerId },
  };
};

export const useScrambleStore = (): ScrambleStore => {
  const { loopStore, nameStore, scrambleStore } = useScrambleEventStores();
  const setScore = useCallback(
    async (teamId: TeamId, holeId: string, score: number): Promise<void> => {
      if (!Number.isInteger(score) || score < 1) {
        throw new RangeError("Score must be a positive integer");
      }
      const key = scrambleScoreKey(teamId, holeId);
      await scrambleStore.updateState(
        { [`scores/${key}`]: score },
        (previous) => ({
          ...previous,
          scores: { ...previous.scores, [key]: score },
        }),
      );
    },
    [scrambleStore],
  );

  const actions = useMemo<ScrambleActions>(
    () => ({
      async resetScores() {
        await scrambleStore.updateState(
          { drives: null, locks: null, scores: null },
          () => EMPTY_SCRAMBLE_STATE,
        );
      },
      async setDrive(teamId, holeId, playerId) {
        const key = scrambleScoreKey(teamId, holeId);
        const nextPlayerId =
          scrambleStore.state.drives[key] === playerId ? null : playerId;
        await scrambleStore.updateState(
          { [`drives/${key}`]: nextPlayerId },
          (previous) => updateDriveState(previous, key, nextPlayerId),
        );
      },
      async setLoopCombination(combination) {
        await loopStore.updateState({ loopCombo: combination }, () => ({
          loopCombo: combination,
        }));
      },
      setScore,
      async setTeamName(teamId, name) {
        const normalizedName = name.trim();
        if (normalizedName.length === 0) {
          throw new Error("Team name cannot be blank");
        }
        await nameStore.updateState(
          { [`teamNames/${teamId}`]: normalizedName },
          (previous) => ({
            teamNames: {
              ...DEFAULT_TEAM_NAMES,
              ...previous.teamNames,
              [teamId]: normalizedName,
            },
          }),
        );
      },
      async toggleLock(holeId) {
        const isLocked = scrambleStore.state.locks[holeId] !== true;
        await scrambleStore.updateState(
          { [`locks/${holeId}`]: isLocked },
          (previous) => ({
            ...previous,
            locks: { ...previous.locks, [holeId]: isLocked },
          }),
        );
      },
    }),
    [loopStore, nameStore, scrambleStore, setScore],
  );

  return {
    actions,
    loopCombination: loopStore.state.loopCombo,
    networkState: scrambleStore.networkState,
    state: scrambleStore.state,
    teamNames: { ...DEFAULT_TEAM_NAMES, ...nameStore.state.teamNames },
  };
};
