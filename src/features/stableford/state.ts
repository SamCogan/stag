import * as v from "valibot";

import {
  DEFAULT_STABLEFORD_GROUP_NAMES,
  DEFAULT_STABLEFORD_GROUPS,
  STABLEFORD_CONFIG,
  stablefordGroupIdSchema,
  type StablefordGroupId,
} from "./config";
import { stablefordScoreKey } from "./scoring";

const positiveIntegerSchema = v.pipe(v.number(), v.integer(), v.minValue(1));
const handicapSchema = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(0),
  v.maxValue(54),
);

const groupNamesSchema = v.object({
  A: v.pipe(v.string(), v.nonEmpty()),
  B: v.pipe(v.string(), v.nonEmpty()),
  C: v.pipe(v.string(), v.nonEmpty()),
});

export const stablefordStateSchema = v.object({
  groupNames: v.optional(groupNamesSchema, DEFAULT_STABLEFORD_GROUP_NAMES),
  groups: v.optional(v.record(v.string(), stablefordGroupIdSchema), {}),
  handicaps: v.optional(v.record(v.string(), handicapSchema), {}),
  locks: v.optional(v.record(v.string(), v.boolean()), {}),
  pickups: v.optional(v.record(v.string(), v.boolean()), {}),
  scores: v.optional(v.record(v.string(), positiveIntegerSchema), {}),
});

export type StablefordState = v.InferOutput<typeof stablefordStateSchema>;

const createDefaultGroups = (): Record<string, StablefordGroupId> => {
  const groups: Record<string, StablefordGroupId> = {};
  for (const groupId of ["A", "B", "C"] as const) {
    for (const playerId of DEFAULT_STABLEFORD_GROUPS[groupId]) {
      groups[playerId] = groupId;
    }
  }
  return groups;
};

const defaultGroups = createDefaultGroups();

const defaultHandicaps = Object.fromEntries(
  STABLEFORD_CONFIG.players.map((player) => [player.id, player.handicap]),
);

const isRecord = (input: unknown): input is Record<string, unknown> =>
  typeof input === "object" && input !== null && !Array.isArray(input);

const parseRecord = <Value>(
  input: unknown,
  parseValue: (value: unknown) => Value | undefined,
): Record<string, Value> => {
  if (!isRecord(input)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(input).flatMap(([key, value]) => {
      const parsed = parseValue(value);
      return parsed === undefined ? [] : [[key, parsed]];
    }),
  );
};

const parseBoolean = (input: unknown): boolean | undefined =>
  typeof input === "boolean" ? input : undefined;

const parseWithSchema =
  <Output>(
    schema: v.BaseSchema<unknown, Output, v.BaseIssue<unknown>>,
  ): ((input: unknown) => Output | undefined) =>
  (input) => {
    const result = v.safeParse(schema, input);
    return result.success ? result.output : undefined;
  };

const parseGroupNames = (input: unknown): Record<StablefordGroupId, string> => {
  const parsed = parseRecord(
    input,
    parseWithSchema(v.pipe(v.string(), v.nonEmpty())),
  );
  return {
    A: parsed["A"] ?? DEFAULT_STABLEFORD_GROUP_NAMES.A,
    B: parsed["B"] ?? DEFAULT_STABLEFORD_GROUP_NAMES.B,
    C: parsed["C"] ?? DEFAULT_STABLEFORD_GROUP_NAMES.C,
  };
};

export const EMPTY_STABLEFORD_STATE: StablefordState = v.parse(
  stablefordStateSchema,
  {
    groupNames: DEFAULT_STABLEFORD_GROUP_NAMES,
    groups: defaultGroups,
    handicaps: defaultHandicaps,
  },
);

export const parseStablefordState = (input: unknown): StablefordState => {
  if (!isRecord(input)) {
    return EMPTY_STABLEFORD_STATE;
  }

  return {
    groupNames: parseGroupNames(input["groupNames"]),
    groups: {
      ...defaultGroups,
      ...parseRecord(input["groups"], parseWithSchema(stablefordGroupIdSchema)),
    },
    handicaps: {
      ...defaultHandicaps,
      ...parseRecord(input["handicaps"], parseWithSchema(handicapSchema)),
    },
    locks: parseRecord(input["locks"], parseBoolean),
    pickups: parseRecord(input["pickups"], parseBoolean),
    scores: parseRecord(
      input["scores"],
      parseWithSchema(positiveIntegerSchema),
    ),
  };
};

const withoutKey = <Value>(
  record: Readonly<Record<string, Value>>,
  key: string,
): Record<string, Value> => {
  return Object.fromEntries(
    Object.entries(record).filter(([entryKey]) => entryKey !== key),
  );
};

export const setStablefordScore = (
  state: StablefordState,
  playerId: string,
  holeId: string,
  gross: number,
): StablefordState => {
  if (!Number.isInteger(gross) || gross < 1) {
    throw new RangeError("Gross score must be a positive integer");
  }

  const key = stablefordScoreKey(playerId, holeId);
  return {
    ...state,
    pickups: withoutKey(state.pickups, key),
    scores: { ...state.scores, [key]: gross },
  };
};

export const setStablefordPickup = (
  state: StablefordState,
  playerId: string,
  holeId: string,
): StablefordState => {
  const key = stablefordScoreKey(playerId, holeId);
  return {
    ...state,
    pickups: { ...state.pickups, [key]: true },
    scores: withoutKey(state.scores, key),
  };
};

export const clearStablefordHole = (
  state: StablefordState,
  playerId: string,
  holeId: string,
): StablefordState => {
  const key = stablefordScoreKey(playerId, holeId);
  return {
    ...state,
    pickups: withoutKey(state.pickups, key),
    scores: withoutKey(state.scores, key),
  };
};

export const setStablefordHandicap = (
  state: StablefordState,
  playerId: string,
  handicap: number,
): StablefordState => {
  if (!Number.isInteger(handicap) || handicap < 0 || handicap > 54) {
    throw new RangeError("Handicap must be an integer from 0 through 54");
  }

  return {
    ...state,
    handicaps: { ...state.handicaps, [playerId]: handicap },
  };
};

export const setStablefordGroup = (
  state: StablefordState,
  playerId: string,
  groupId: StablefordGroupId,
): StablefordState => ({
  ...state,
  groups: { ...state.groups, [playerId]: groupId },
});

export interface GroupValidation {
  counts: Readonly<Record<StablefordGroupId, number>>;
  isValid: boolean;
  unassignedPlayerIds: readonly string[];
}

export const validateStablefordGroups = (
  groups: StablefordState["groups"],
): GroupValidation => {
  const counts: Record<StablefordGroupId, number> = { A: 0, B: 0, C: 0 };
  const unassignedPlayerIds: string[] = [];

  for (const player of STABLEFORD_CONFIG.players) {
    const groupId = groups[player.id];
    if (groupId === undefined) {
      unassignedPlayerIds.push(player.id);
    } else {
      counts[groupId] += 1;
    }
  }

  return {
    counts,
    isValid:
      unassignedPlayerIds.length === 0 &&
      Object.values(counts).every((count) => count === 4),
    unassignedPlayerIds,
  };
};
