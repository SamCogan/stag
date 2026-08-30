import * as v from "valibot";

import {
  vilaSolHoleSchema,
  type VilaSolHole,
  type VilaSolLoop,
} from "./eventSchemas";

export const VILA_SOL_HOLES = v.parse(v.array(vilaSolHoleSchema), [
  { id: "v1", number: 1, loop: "Out", par: 4, si: 3 },
  { id: "v2", number: 2, loop: "Out", par: 4, si: 7 },
  { id: "v3", number: 3, loop: "Out", par: 4, si: 1 },
  { id: "v4", number: 4, loop: "Out", par: 3, si: 15 },
  { id: "v5", number: 5, loop: "Out", par: 4, si: 11 },
  { id: "v6", number: 6, loop: "Out", par: 5, si: 9 },
  { id: "v7", number: 7, loop: "Out", par: 3, si: 13 },
  { id: "v8", number: 8, loop: "Out", par: 5, si: 5 },
  { id: "v9", number: 9, loop: "Out", par: 4, si: 17 },
  { id: "v10", number: 10, loop: "Mid", par: 4, si: 9 },
  { id: "v11", number: 11, loop: "Mid", par: 5, si: 15 },
  { id: "v12", number: 12, loop: "Mid", par: 4, si: 5 },
  { id: "v13", number: 13, loop: "Mid", par: 3, si: 17 },
  { id: "v14", number: 14, loop: "Mid", par: 5, si: 1 },
  { id: "v15", number: 15, loop: "Mid", par: 3, si: 13 },
  { id: "v16", number: 16, loop: "Mid", par: 4, si: 7 },
  { id: "v17", number: 17, loop: "Mid", par: 4, si: 11 },
  { id: "v18", number: 18, loop: "Mid", par: 4, si: 3 },
  { id: "v19", number: 19, loop: "In", par: 5, si: 6 },
  { id: "v20", number: 20, loop: "In", par: 3, si: 16 },
  { id: "v21", number: 21, loop: "In", par: 4, si: 8 },
  { id: "v22", number: 22, loop: "In", par: 4, si: 12 },
  { id: "v23", number: 23, loop: "In", par: 5, si: 2 },
  { id: "v24", number: 24, loop: "In", par: 4, si: 14 },
  { id: "v25", number: 25, loop: "In", par: 3, si: 18 },
  { id: "v26", number: 26, loop: "In", par: 4, si: 4 },
  { id: "v27", number: 27, loop: "In", par: 4, si: 10 },
]);

export const VILA_SOL_LOOP_COMBINATIONS = {
  "Out+Mid": ["Out", "Mid"],
  "Out+In": ["Out", "In"],
  "Mid+In": ["Mid", "In"],
} as const satisfies Record<string, readonly VilaSolLoop[]>;

export type VilaSolLoopCombination = keyof typeof VILA_SOL_LOOP_COMBINATIONS;

export const DEFAULT_VILA_SOL_LOOP_COMBINATION: VilaSolLoopCombination =
  "Out+Mid";

export const getVilaSolHoles = (
  combination: VilaSolLoopCombination = DEFAULT_VILA_SOL_LOOP_COMBINATION,
): VilaSolHole[] => {
  const loops: readonly VilaSolLoop[] = VILA_SOL_LOOP_COMBINATIONS[combination];
  return VILA_SOL_HOLES.filter((hole) => loops.includes(hole.loop));
};
