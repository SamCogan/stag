import {
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
  type Options,
} from "nuqs";
import * as v from "valibot";

import { teamIdSchema, type TeamId } from "./config/eventSchemas";

export const APP_MODES = [
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
] as const;

export type RouteMode = (typeof APP_MODES)[number];
export type AppMode = Exclude<
  RouteMode,
  "stroke" | "stroke-org" | "stroke-stats"
>;

export interface AppRoute {
  eventCode: string;
  key: string;
  mode: AppMode;
  teamId?: TeamId;
}

export const routeParsers = {
  event: parseAsString,
  key: parseAsString.withDefault(""),
  mode: parseAsStringLiteral(APP_MODES).withDefault("home"),
  team: parseAsString,
};

const golfModes = new Set<AppMode>([
  "scramble",
  "scramble-org",
  "stableford",
  "stableford-org",
  "stableford-stats",
]);

const normalizeMode = (mode: RouteMode): AppMode => {
  if (mode === "stroke") {
    return "stableford";
  }
  if (mode === "stroke-org") {
    return "stableford-org";
  }
  return mode === "stroke-stats" ? "stableford-stats" : mode;
};

const getEventCode = (
  mode: AppMode,
  requestedEvent: string | undefined,
): string => {
  if (mode.startsWith("stableford")) {
    return "coollattin-stableford";
  }
  if (requestedEvent === undefined || requestedEvent.length === 0) {
    return golfModes.has(mode) ? "vilasol" : "stag2026";
  }
  return requestedEvent;
};

export const resolveRoute = (
  values: Readonly<{
    event: string | null;
    key: string;
    mode: RouteMode;
    team: string | null;
  }>,
): AppRoute => {
  const mode = normalizeMode(values.mode);
  const requestedTeam = values.team?.trim().toUpperCase();
  const parsedTeam =
    requestedTeam === undefined
      ? undefined
      : v.safeParse(teamIdSchema, requestedTeam);
  const requestedEvent = values.event?.trim();

  return {
    eventCode: getEventCode(mode, requestedEvent),
    key: values.key,
    mode,
    ...(parsedTeam?.success === true ? { teamId: parsedTeam.output } : {}),
  };
};

export const useAppRoute = (
  options?: Options,
): readonly [
  AppRoute,
  ReturnType<typeof useQueryStates<typeof routeParsers>>[1],
] => {
  const [values, setValues] = useQueryStates(routeParsers, options);
  return [resolveRoute(values), setValues] as const;
};
