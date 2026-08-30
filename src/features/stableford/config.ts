import * as v from "valibot";

export const stablefordGroupIdSchema = v.picklist(["A", "B", "C"]);

const stablefordHoleSchema = v.object({
  id: v.pipe(v.string(), v.nonEmpty()),
  number: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(18)),
  par: v.pipe(v.number(), v.integer(), v.minValue(3), v.maxValue(5)),
  strokeIndex: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(18)),
  yards: v.pipe(v.number(), v.integer(), v.minValue(1)),
});

const stablefordPlayerSchema = v.object({
  handicap: v.pipe(v.number(), v.integer(), v.minValue(0)),
  id: v.pipe(v.string(), v.nonEmpty()),
  initials: v.pipe(v.string(), v.nonEmpty()),
  name: v.pipe(v.string(), v.nonEmpty()),
});

const stablefordConfigSchema = v.object({
  courseName: v.pipe(v.string(), v.nonEmpty()),
  holes: v.pipe(v.array(stablefordHoleSchema), v.length(18)),
  players: v.pipe(v.array(stablefordPlayerSchema), v.length(12)),
  teeName: v.pipe(v.string(), v.nonEmpty()),
  title: v.pipe(v.string(), v.nonEmpty()),
});

export type StablefordGroupId = v.InferOutput<typeof stablefordGroupIdSchema>;
export type StablefordHole = v.InferOutput<typeof stablefordHoleSchema>;
export type StablefordPlayer = v.InferOutput<typeof stablefordPlayerSchema>;

export const STABLEFORD_EVENT_CODE = "coollattin-stableford";
export const STABLEFORD_LOCAL_STORAGE_KEY = "coollattin-stableford-state-v1";
export const STABLEFORD_IDENTITY_STORAGE_KEY =
  "coollattin-stableford-player-v1";

export const STABLEFORD_CONFIG = v.parse(stablefordConfigSchema, {
  courseName: "Coollattin Golf Club",
  teeName: "Men's White Tees",
  title: "Coollattin Individual Stableford",
  holes: [
    { id: "1", number: 1, par: 4, strokeIndex: 1, yards: 400 },
    { id: "2", number: 2, par: 4, strokeIndex: 6, yards: 360 },
    { id: "3", number: 3, par: 5, strokeIndex: 15, yards: 456 },
    { id: "4", number: 4, par: 4, strokeIndex: 3, yards: 397 },
    { id: "5", number: 5, par: 3, strokeIndex: 13, yards: 115 },
    { id: "6", number: 6, par: 5, strokeIndex: 14, yards: 497 },
    { id: "7", number: 7, par: 3, strokeIndex: 7, yards: 184 },
    { id: "8", number: 8, par: 4, strokeIndex: 8, yards: 373 },
    { id: "9", number: 9, par: 4, strokeIndex: 5, yards: 424 },
    { id: "10", number: 10, par: 3, strokeIndex: 11, yards: 167 },
    { id: "11", number: 11, par: 5, strokeIndex: 2, yards: 570 },
    { id: "12", number: 12, par: 5, strokeIndex: 18, yards: 465 },
    { id: "13", number: 13, par: 4, strokeIndex: 12, yards: 321 },
    { id: "14", number: 14, par: 4, strokeIndex: 4, yards: 383 },
    { id: "15", number: 15, par: 4, strokeIndex: 10, yards: 336 },
    { id: "16", number: 16, par: 4, strokeIndex: 17, yards: 301 },
    { id: "17", number: 17, par: 4, strokeIndex: 9, yards: 329 },
    { id: "18", number: 18, par: 3, strokeIndex: 16, yards: 151 },
  ],
  players: [
    { handicap: 32, id: "sam", initials: "SA", name: "Sam" },
    { handicap: 32, id: "kyle", initials: "K", name: "Kyle" },
    { handicap: 29, id: "ian", initials: "I", name: "Ian" },
    { handicap: 5, id: "paulc", initials: "PC", name: "Paul C" },
    { handicap: 24, id: "aaron", initials: "A", name: "Aaron" },
    { handicap: 12, id: "jack", initials: "JK", name: "Jack" },
    { handicap: 24, id: "jackh", initials: "JH", name: "Jack H" },
    { handicap: 10, id: "jamesw", initials: "JAW", name: "James W" },
    { handicap: 17, id: "joew", initials: "JOW", name: "Joe W" },
    { handicap: 18, id: "jamie", initials: "JM", name: "Jamie" },
    { handicap: 29, id: "paulw", initials: "PW", name: "Paul W" },
    { handicap: 16, id: "ste", initials: "ST", name: "Ste" },
  ],
});

export const DEFAULT_STABLEFORD_GROUPS: Readonly<
  Record<StablefordGroupId, readonly string[]>
> = {
  A: ["sam", "kyle", "ian", "paulc"],
  B: ["aaron", "jack", "jackh", "jamesw"],
  C: ["joew", "jamie", "paulw", "ste"],
};

export const DEFAULT_STABLEFORD_GROUP_NAMES: Readonly<
  Record<StablefordGroupId, string>
> = {
  A: "Group A",
  B: "Group B",
  C: "Group C",
};
