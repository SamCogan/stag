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
  "stroke",
  "stroke-org",
  "stroke-stats",
] as const;

export type AppMode = (typeof APP_MODES)[number];

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
  "stroke",
  "stroke-org",
  "stroke-stats",
]);

export const resolveRoute = (
  values: Readonly<{
    event: string | null;
    key: string;
    mode: AppMode;
    team: string | null;
  }>,
): AppRoute => {
  const requestedTeam = values.team?.trim().toUpperCase();
  const parsedTeam =
    requestedTeam === undefined
      ? undefined
      : v.safeParse(teamIdSchema, requestedTeam);
  const requestedEvent = values.event?.trim();
  const defaultEventCode = golfModes.has(values.mode) ? "vilasol" : "stag2026";

  return {
    eventCode:
      requestedEvent === undefined || requestedEvent.length === 0
        ? defaultEventCode
        : requestedEvent,
    key: values.key,
    mode: values.mode,
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
