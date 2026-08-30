import { expect, test } from "bun:test";

import { render, within } from "@testing-library/react/pure";
import { NuqsAdapter } from "nuqs/adapters/react";

import App from "./App";

const TEST_URL = "http://localhost/";

const resetBrowserState = () => {
  if (globalThis.location.href === "about:blank") {
    globalThis.location.href = TEST_URL;
  } else {
    globalThis.history.replaceState(null, "", TEST_URL);
  }
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
};

const renderRoute = (search: string) => {
  globalThis.history.replaceState(null, "", `/${search}`);
  const host = globalThis.document.createElement("div");
  const container = globalThis.document.createElement("div");
  host.attachShadow({ mode: "open" }).append(container);
  globalThis.document.body.append(host);

  return {
    ...render(<App />, {
      container,
      wrapper: NuqsAdapter,
    }),
    host,
  };
};

const expectRouteHeadings = (
  route: string,
  headings: readonly string[],
): void => {
  resetBrowserState();
  const { container, host, unmount } = renderRoute(route);

  try {
    for (const heading of headings) {
      expect(
        within(container).getByRole("heading", { name: heading }),
      ).toBeInTheDocument();
    }
  } finally {
    unmount();
    host.remove();
    resetBrowserState();
  }
};

test("renders the expected application routes", () => {
  expectRouteHeadings("?mode=home", [
    "Team Login",
    "Pub Golf Live",
    "Vila Sol Scramble Live",
    "Vila Sol Stroke Live",
    "Overall Event Standings",
  ]);

  for (const [route, heading] of [
    ["?event=stag2026&key=team1ONE&mode=captain&team=A", "Pub Golf Scoring"],
    [
      "?event=vilasol&key=TEAM2two&mode=scramble&team=B",
      "Texas Scramble - Vila Sol",
    ],
    [
      "?event=vilasol&key=TEAM3THREE&mode=stroke&team=C",
      "Stroke Play - Vila Sol",
    ],
  ] as const) {
    expectRouteHeadings(route, [heading]);
  }

  for (const route of [
    "?event=stag2026&mode=organizer",
    "?event=vilasol&mode=scramble-org",
    "?event=vilasol&mode=stroke-org",
  ]) {
    expectRouteHeadings(route, ["Organizer Access"]);
  }

  for (const [route, headings] of [
    ["?event=stag2026&mode=stats", ["Pub Golf Stats"]],
    [
      "?event=vilasol&mode=stroke-stats",
      ["Vila Sol Stroke Live", "Top Net Players"],
    ],
  ] as const) {
    expectRouteHeadings(route, headings);
  }

  expectRouteHeadings("?event=stag2026&mode=captain&team=invalid", [
    "Choose a valid team",
  ]);
});
