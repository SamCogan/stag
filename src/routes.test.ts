import { expect, test } from "bun:test";

import { APP_MODES, resolveRoute, type AppMode } from "./routes";

const PUB_MODES = [
  ["home"],
  ["captain"],
  ["organizer"],
  ["stats"],
] as const satisfies readonly (readonly [AppMode])[];
const GOLF_MODES = [
  ["scramble"],
  ["scramble-org"],
  ["stroke"],
  ["stroke-org"],
  ["stroke-stats"],
] as const satisfies readonly (readonly [AppMode])[];

const resolveFor = ({
  event = null,
  mode = "home",
  team = null,
}: {
  event?: string | null;
  mode?: AppMode;
  team?: string | null;
}) =>
  resolveRoute({
    event,
    key: "",
    mode,
    team,
  });

test("preserves the deployed application modes", () => {
  expect(APP_MODES).toEqual([
    "home",
    "captain",
    "organizer",
    "stats",
    "scramble",
    "scramble-org",
    "stroke",
    "stroke-org",
    "stroke-stats",
  ]);
});

test.each(PUB_MODES)("%s defaults to the deployed Pub event", (mode) => {
  expect(resolveFor({ mode }).eventCode).toBe("stag2026");
});

test.each(GOLF_MODES)("%s defaults to the deployed golf event", (mode) => {
  expect(resolveFor({ mode }).eventCode).toBe("vilasol");
});

test.each([
  [" a ", "A"],
  ["b", "B"],
  [" C", "C"],
] as const)("normalizes valid team %s to %s", (team, expectedTeam) => {
  expect(resolveFor({ team }).teamId).toBe(expectedTeam);
});

test.each(["", "D", "AB", "team-a"])("omits invalid team %s", (team) => {
  expect(resolveFor({ team })).not.toHaveProperty("teamId");
});

test("preserves an explicit event code", () => {
  expect(resolveFor({ event: "custom-event", mode: "stroke" }).eventCode).toBe(
    "custom-event",
  );
});

test.each(["", "   "])("falls back from empty event %p", (event) => {
  expect(resolveFor({ event }).eventCode).toBe("stag2026");
});
