import * as v from "valibot";

import { lockRecordSchema, scoreRecordSchema } from "./eventState";
import {
  DEFAULT_VILA_SOL_LOOP_COMBINATION,
  VILA_SOL_LOOP_COMBINATIONS,
  type VilaSolLoopCombination,
} from "../config/vilaSol";

export const SCRAMBLE_EVENT_CODE = "vilasol-scramble";
export const VILA_SOL_CONFIG_EVENT_CODE = "vilasol-config";
export const STAG_CONFIG_EVENT_CODE = "stag-config";

export const SCRAMBLE_LOCAL_STORAGE_KEY = "golf-scramble-state-v1";
export const VILA_SOL_LOOP_STORAGE_KEY = "golf-loops-v1";
export const TEAM_NAMES_STORAGE_KEY = "team-names-v1";

const driveRecordSchema = v.record(
  v.string(),
  v.pipe(v.string(), v.nonEmpty()),
);
export const scrambleStateSchema = v.object({
  drives: v.optional(driveRecordSchema, {}),
  locks: v.optional(lockRecordSchema, {}),
  scores: v.optional(scoreRecordSchema, {}),
});

export const teamNamesSchema = v.object({
  A: v.pipe(v.string(), v.nonEmpty()),
  B: v.pipe(v.string(), v.nonEmpty()),
  C: v.pipe(v.string(), v.nonEmpty()),
});

const loopCombinationSchema = v.picklist(
  Object.keys(VILA_SOL_LOOP_COMBINATIONS) as [
    VilaSolLoopCombination,
    ...VilaSolLoopCombination[],
  ],
);

export const vilaSolConfigSchema = v.object({
  loopCombo: v.optional(
    loopCombinationSchema,
    DEFAULT_VILA_SOL_LOOP_COMBINATION,
  ),
});

export const stagConfigSchema = v.object({
  teamNames: v.optional(teamNamesSchema),
});

export type ScrambleState = v.InferOutput<typeof scrambleStateSchema>;
export type StagConfig = v.InferOutput<typeof stagConfigSchema>;
export type TeamNames = v.InferOutput<typeof teamNamesSchema>;
export type VilaSolConfig = v.InferOutput<typeof vilaSolConfigSchema>;

export const EMPTY_SCRAMBLE_STATE: ScrambleState = {
  drives: {},
  locks: {},
  scores: {},
};

export const parseScrambleState = (input: unknown): ScrambleState => {
  const result = v.safeParse(scrambleStateSchema, input);
  return result.success ? result.output : EMPTY_SCRAMBLE_STATE;
};

export const parseVilaSolConfig = (input: unknown): VilaSolConfig => {
  const legacyResult = v.safeParse(loopCombinationSchema, input);
  if (legacyResult.success) {
    return { loopCombo: legacyResult.output };
  }

  const result = v.safeParse(vilaSolConfigSchema, input);
  return result.success
    ? result.output
    : { loopCombo: DEFAULT_VILA_SOL_LOOP_COMBINATION };
};

export const parseStagConfig = (input: unknown): StagConfig => {
  const legacyResult = v.safeParse(teamNamesSchema, input);
  if (legacyResult.success) {
    return { teamNames: legacyResult.output };
  }

  const result = v.safeParse(stagConfigSchema, input);
  return result.success ? result.output : {};
};
