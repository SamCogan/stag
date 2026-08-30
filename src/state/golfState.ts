import * as v from "valibot";

import { lockRecordSchema, scoreRecordSchema } from "./eventState";

export const SCRAMBLE_EVENT_CODE = "vilasol-scramble";
export const STROKE_EVENT_CODE = "vilasol-stroke";
export const VILA_SOL_CONFIG_EVENT_CODE = "vilasol-config";
export const STAG_CONFIG_EVENT_CODE = "stag-config";

export const SCRAMBLE_LOCAL_STORAGE_KEY = "golf-scramble-state-v1";
export const STROKE_LOCAL_STORAGE_KEY = "golf-stroke-state-v1";
export const VILA_SOL_LOOP_STORAGE_KEY = "golf-loops-v1";
export const TEAM_NAMES_STORAGE_KEY = "team-names-v1";

const driveRecordSchema = v.record(
  v.string(),
  v.pipe(v.string(), v.nonEmpty()),
);
const handicapRecordSchema = v.record(
  v.string(),
  v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(54)),
);

export const scrambleStateSchema = v.object({
  drives: v.optional(driveRecordSchema, {}),
  locks: v.optional(lockRecordSchema, {}),
  scores: v.optional(scoreRecordSchema, {}),
});

export const strokeStateSchema = v.object({
  handicaps: v.optional(handicapRecordSchema, {}),
  locks: v.optional(lockRecordSchema, {}),
  scores: v.optional(scoreRecordSchema, {}),
});

export const teamNamesSchema = v.object({
  A: v.pipe(v.string(), v.nonEmpty()),
  B: v.pipe(v.string(), v.nonEmpty()),
  C: v.pipe(v.string(), v.nonEmpty()),
});

export type ScrambleState = v.InferOutput<typeof scrambleStateSchema>;
export type StrokeState = v.InferOutput<typeof strokeStateSchema>;
export type TeamNames = v.InferOutput<typeof teamNamesSchema>;

export const EMPTY_SCRAMBLE_STATE: ScrambleState = {
  drives: {},
  locks: {},
  scores: {},
};

export const EMPTY_STROKE_STATE: StrokeState = {
  handicaps: {},
  locks: {},
  scores: {},
};

export const parseScrambleState = (input: unknown): ScrambleState => {
  const result = v.safeParse(scrambleStateSchema, input);
  return result.success ? result.output : EMPTY_SCRAMBLE_STATE;
};

export const parseStrokeState = (input: unknown): StrokeState => {
  const result = v.safeParse(strokeStateSchema, input);
  return result.success ? result.output : EMPTY_STROKE_STATE;
};
