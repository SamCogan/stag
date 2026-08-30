import { expect, test } from "bun:test";

import { APP_MODES, resolveRoute, type RouteMode } from "./routes";

const PUB_MODES = [
  ["home"],
  ["captain"],
  ["organizer"],
  ["stats"],
] as const satisfies readonly (readonly [RouteMode])[];
const SCRAMBLE_MODES = [
  ["scramble"],
  ["scramble-org"],
] as const satisfies readonly (readonly [RouteMode])[];
const STABLEFORD_MODES = [
  ["stableford"],
  ["stableford-org"],
  ["stableford-stats"],
  ["stroke"],
  ["stroke-org"],
  ["stroke-stats"],
] as const satisfies readonly (readonly [RouteMode])[];

const resolveFor = ({
  event = null,
  mode = "home",
  team = null,
}: {
  event?: string | null;
  mode?: RouteMode;
  team?: string | null;
}) =>
  resolveRoute({
    event,
    key: "",
    mode,
    team,
  });

test("accepts canonical modes and legacy Stroke aliases", () => {
  expect(APP_MODES).toEqual([
    "home",
    "captain",
    "organizer",
    "stats",
    "scramble",
    "scramble-org",
    "stableford",
    "stableford-org",
    "stableford-stats",
    "stroke",
    "stroke-org",
    "stroke-stats",
  ]);
});

test.each(PUB_MODES)("%s defaults to the deployed Pub event", (mode) => {
  expect(resolveFor({ mode }).eventCode).toBe("stag2026");
});

test.each(SCRAMBLE_MODES)("%s defaults to the deployed golf event", (mode) => {
  expect(resolveFor({ mode }).eventCode).toBe("vilasol");
});

test.each(STABLEFORD_MODES)(
  "%s resolves to the isolated Stableford event",
  (mode) => {
    expect(resolveFor({ event: "vilasol", mode }).eventCode).toBe(
      "coollattin-stableford",
    );
  },
);

test.each([
  ["stroke", "stableford"],
  ["stroke-org", "stableford-org"],
  ["stroke-stats", "stableford-stats"],
] as const)("maps legacy %s to %s", (mode, expectedMode) => {
  expect(resolveFor({ mode }).mode).toBe(expectedMode);
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
  expect(
    resolveFor({ event: "custom-event", mode: "scramble" }).eventCode,
  ).toBe("custom-event");
});

test.each(["", "   "])("falls back from empty event %p", (event) => {
  expect(resolveFor({ event }).eventCode).toBe("stag2026");
});
