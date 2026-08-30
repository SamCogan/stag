import * as v from "valibot";

export const teamIdSchema = v.picklist(["A", "B", "C"]);

export const playerSchema = v.object({
  id: v.pipe(v.string(), v.nonEmpty()),
  image: v.pipe(v.string(), v.nonEmpty()),
  name: v.pipe(v.string(), v.nonEmpty()),
});

export const teamSchema = v.object({
  key: v.pipe(v.string(), v.nonEmpty()),
  label: v.pipe(v.string(), v.nonEmpty()),
  players: v.pipe(v.array(playerSchema), v.length(3)),
});

export const pubHoleSchema = v.object({
  id: v.pipe(v.string(), v.nonEmpty()),
  name: v.pipe(v.string(), v.nonEmpty()),
  par: v.pipe(v.number(), v.integer(), v.minValue(1)),
  pub: v.pipe(v.string(), v.nonEmpty()),
});

export const pubEventSchema = v.object({
  holes: v.pipe(v.array(pubHoleSchema), v.length(18)),
  teams: v.object({
    A: teamSchema,
    B: teamSchema,
    C: teamSchema,
  }),
  title: v.pipe(v.string(), v.nonEmpty()),
});

export type Player = v.InferOutput<typeof playerSchema>;
export type PubEvent = v.InferOutput<typeof pubEventSchema>;
export type PubHole = v.InferOutput<typeof pubHoleSchema>;
export type Team = v.InferOutput<typeof teamSchema>;
export type TeamId = v.InferOutput<typeof teamIdSchema>;
