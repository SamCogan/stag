import { expect, test } from "bun:test";

import { DEFAULT_STABLEFORD_GROUPS, STABLEFORD_CONFIG } from "./config";

const compareAlphabetically = (left: string, right: string): number =>
  left.localeCompare(right);

test("preserves every Coollattin hole tuple", () => {
  const holeTuples = STABLEFORD_CONFIG.holes.map(
    ({ id, number, par, strokeIndex, yards }) =>
      [id, number, par, strokeIndex, yards] as const,
  );

  expect(holeTuples).toEqual([
    ["1", 1, 4, 1, 400],
    ["2", 2, 4, 6, 360],
    ["3", 3, 5, 15, 456],
    ["4", 4, 4, 3, 397],
    ["5", 5, 3, 13, 115],
    ["6", 6, 5, 14, 497],
    ["7", 7, 3, 7, 184],
    ["8", 8, 4, 8, 373],
    ["9", 9, 4, 5, 424],
    ["10", 10, 3, 11, 167],
    ["11", 11, 5, 2, 570],
    ["12", 12, 5, 18, 465],
    ["13", 13, 4, 12, 321],
    ["14", 14, 4, 4, 383],
    ["15", 15, 4, 10, 336],
    ["16", 16, 4, 17, 301],
    ["17", 17, 4, 9, 329],
    ["18", 18, 3, 16, 151],
  ]);
});

test("preserves the front-nine, back-nine, and course totals", () => {
  const frontNine = STABLEFORD_CONFIG.holes.slice(0, 9);
  const backNine = STABLEFORD_CONFIG.holes.slice(9);
  const sumPar = (holes: typeof STABLEFORD_CONFIG.holes): number =>
    holes.reduce((total, hole) => total + hole.par, 0);
  const totalYards = STABLEFORD_CONFIG.holes.reduce(
    (total, hole) => total + hole.yards,
    0,
  );

  expect({
    backNinePar: sumPar(backNine),
    frontNinePar: sumPar(frontNine),
    totalPar: sumPar(STABLEFORD_CONFIG.holes),
    totalYards,
  }).toEqual({
    backNinePar: 36,
    frontNinePar: 36,
    totalPar: 72,
    totalYards: 6229,
  });
});

test("uses every stroke index from 1 through 18 exactly once", () => {
  const strokeIndexes = STABLEFORD_CONFIG.holes
    .map(({ strokeIndex }) => strokeIndex)
    .toSorted((left, right) => left - right);

  expect(strokeIndexes).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  ]);
});

test("preserves all players with credential-ready unique IDs", () => {
  const playerTuples = STABLEFORD_CONFIG.players.map(
    ({ handicap, id, name }) => [id, name, handicap] as const,
  );
  const playerIds = STABLEFORD_CONFIG.players.map(({ id }) => id);

  expect(playerTuples).toEqual([
    ["sam", "Sam", 32],
    ["kyle", "Kyle", 32],
    ["ian", "Ian", 29],
    ["paulc", "Paul C", 5],
    ["aaron", "Aaron", 24],
    ["jack", "Jack", 12],
    ["jackh", "Jack H", 24],
    ["jamesw", "James W", 10],
    ["joew", "Joe W", 17],
    ["jamie", "Jamie", 18],
    ["paulw", "Paul W", 29],
    ["ste", "Ste", 16],
  ]);
  expect(new Set(playerIds).size).toBe(12);
  expect(playerIds.every((id) => /^[a-z][a-z0-9]*$/u.test(id))).toBe(true);
});

test("uses distinct initials for every approved photo placeholder", () => {
  const initials = STABLEFORD_CONFIG.players.map((player) => player.initials);
  expect(new Set(initials).size).toBe(STABLEFORD_CONFIG.players.length);
});

test("assigns four unique players to each default A, B, and C group", () => {
  expect(DEFAULT_STABLEFORD_GROUPS).toEqual({
    A: ["sam", "kyle", "ian", "paulc"],
    B: ["aaron", "jack", "jackh", "jamesw"],
    C: ["joew", "jamie", "paulw", "ste"],
  });

  for (const playerIds of Object.values(DEFAULT_STABLEFORD_GROUPS)) {
    expect(playerIds).toHaveLength(4);
    expect(new Set(playerIds).size).toBe(4);
  }

  const assignedPlayerIds = Object.values(DEFAULT_STABLEFORD_GROUPS).flat();
  const configuredPlayerIds = STABLEFORD_CONFIG.players.map(({ id }) => id);

  expect(new Set(assignedPlayerIds).size).toBe(12);
  expect(assignedPlayerIds.toSorted(compareAlphabetically)).toEqual(
    configuredPlayerIds.toSorted(compareAlphabetically),
  );
});
