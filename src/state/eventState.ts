import * as v from "valibot";

export const PUB_LOCAL_STORAGE_KEY = "pub-golf-local-state-v2";

const positiveIntegerSchema = v.pipe(v.number(), v.integer(), v.minValue(1));
const nonnegativeIntegerSchema = v.pipe(v.number(), v.integer(), v.minValue(0));

export const scoreRecordSchema = v.record(v.string(), positiveIntegerSchema);
export const lockRecordSchema = v.record(v.string(), v.boolean());
export const penaltyRecordSchema = v.record(
  v.string(),
  v.record(v.string(), nonnegativeIntegerSchema),
);

export const pubStateSchema = v.object({
  locks: v.optional(lockRecordSchema, {}),
  penalties: v.optional(penaltyRecordSchema, {}),
  scores: v.optional(scoreRecordSchema, {}),
});

export type PubState = v.InferOutput<typeof pubStateSchema>;

export const EMPTY_PUB_STATE: PubState = {
  locks: {},
  penalties: {},
  scores: {},
};

export const parsePubState = (input: unknown): PubState => {
  const isCurrentShape =
    typeof input === "object" &&
    input !== null &&
    !Array.isArray(input) &&
    ["locks", "penalties", "scores"].some((key) => Object.hasOwn(input, key));

  if (!isCurrentShape) {
    const legacyScores = v.safeParse(scoreRecordSchema, input);
    return legacyScores.success
      ? { ...EMPTY_PUB_STATE, scores: legacyScores.output }
      : EMPTY_PUB_STATE;
  }

  const current = v.safeParse(pubStateSchema, input);
  return current.success ? current.output : EMPTY_PUB_STATE;
};
