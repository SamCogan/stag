import { expect, test } from "bun:test";

import {
  getVilaSolHoles,
  VILA_SOL_HOLES,
  VILA_SOL_LOOP_COMBINATIONS,
  type VilaSolLoopCombination,
} from "./vilaSol";

const LOOP_COMBINATIONS = [
  ["Out+Mid"],
  ["Out+In"],
  ["Mid+In"],
] as const satisfies readonly (readonly [VilaSolLoopCombination])[];

test("preserves all 27 Vila Sol holes", () => {
  expect(VILA_SOL_HOLES).toEqual([
    { id: "v1", loop: "Out", number: 1, par: 4, si: 3 },
    { id: "v2", loop: "Out", number: 2, par: 4, si: 7 },
    { id: "v3", loop: "Out", number: 3, par: 4, si: 1 },
    { id: "v4", loop: "Out", number: 4, par: 3, si: 15 },
    { id: "v5", loop: "Out", number: 5, par: 4, si: 11 },
    { id: "v6", loop: "Out", number: 6, par: 5, si: 9 },
    { id: "v7", loop: "Out", number: 7, par: 3, si: 13 },
    { id: "v8", loop: "Out", number: 8, par: 5, si: 5 },
    { id: "v9", loop: "Out", number: 9, par: 4, si: 17 },
    { id: "v10", loop: "Mid", number: 10, par: 4, si: 9 },
    { id: "v11", loop: "Mid", number: 11, par: 5, si: 15 },
    { id: "v12", loop: "Mid", number: 12, par: 4, si: 5 },
    { id: "v13", loop: "Mid", number: 13, par: 3, si: 17 },
    { id: "v14", loop: "Mid", number: 14, par: 5, si: 1 },
    { id: "v15", loop: "Mid", number: 15, par: 3, si: 13 },
    { id: "v16", loop: "Mid", number: 16, par: 4, si: 7 },
    { id: "v17", loop: "Mid", number: 17, par: 4, si: 11 },
    { id: "v18", loop: "Mid", number: 18, par: 4, si: 3 },
    { id: "v19", loop: "In", number: 19, par: 5, si: 6 },
    { id: "v20", loop: "In", number: 20, par: 3, si: 16 },
    { id: "v21", loop: "In", number: 21, par: 4, si: 8 },
    { id: "v22", loop: "In", number: 22, par: 4, si: 12 },
    { id: "v23", loop: "In", number: 23, par: 5, si: 2 },
    { id: "v24", loop: "In", number: 24, par: 4, si: 14 },
    { id: "v25", loop: "In", number: 25, par: 3, si: 18 },
    { id: "v26", loop: "In", number: 26, par: 4, si: 4 },
    { id: "v27", loop: "In", number: 27, par: 4, si: 10 },
  ]);
});

test("preserves the three loop combinations", () => {
  expect(VILA_SOL_LOOP_COMBINATIONS).toEqual({
    "Mid+In": ["Mid", "In"],
    "Out+In": ["Out", "In"],
    "Out+Mid": ["Out", "Mid"],
  });
});

test.each(LOOP_COMBINATIONS)("%s selects exactly 18 holes", (combination) => {
  expect(getVilaSolHoles(combination)).toHaveLength(18);
});

test.each(LOOP_COMBINATIONS)("%s totals par 72", (combination) => {
  const totalPar = getVilaSolHoles(combination).reduce(
    (total, hole) => total + hole.par,
    0,
  );

  expect(totalPar).toBe(72);
});
