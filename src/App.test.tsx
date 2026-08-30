import { expect, spyOn, test } from "bun:test";

import { render, within } from "@testing-library/react/pure";
import userEvent from "@testing-library/user-event";
import { NuqsAdapter } from "nuqs/adapters/react";

import App from "./App";
import { STABLEFORD_IDENTITY_STORAGE_KEY } from "./features/stableford/config";

const TEST_URL = "http://localhost/";
const locationPrototype = Object.getPrototypeOf(globalThis.location) as Pick<
  Location,
  "assign"
>;

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
  stablefordPlayerId?: string,
): void => {
  resetBrowserState();
  if (stablefordPlayerId !== undefined) {
    globalThis.localStorage.setItem(
      STABLEFORD_IDENTITY_STORAGE_KEY,
      JSON.stringify(stablefordPlayerId),
    );
  }
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
    "Coollattin Individual Stableford",
    "Stableford Player Login",
  ]);
  expectRouteHeadings("?event=stag2026&mode=home", [
    "Team Login",
    "Stableford Player Login",
    "Pub Golf Live",
    "Vila Sol Scramble Live",
    "Coollattin Stableford Live",
    "Overall Event Standings",
  ]);

  for (const [route, heading] of [
    ["?event=stag2026&key=team1ONE&mode=captain&team=A", "Pub Golf Scoring"],
    [
      "?event=vilasol&key=TEAM2two&mode=scramble&team=B",
      "Texas Scramble - Vila Sol",
    ],
  ] as const) {
    expectRouteHeadings(route, [heading]);
  }

  for (const route of [
    "?event=stag2026&mode=organizer",
    "?event=vilasol&mode=scramble-org",
    "?event=coollattin-stableford&mode=stableford-org",
    "?event=vilasol&mode=stroke-org",
  ]) {
    expectRouteHeadings(route, ["Organizer Access"]);
  }

  for (const [route, headings] of [
    ["?event=stag2026&mode=stats", ["Pub Golf Stats"]],
    [
      "?event=coollattin-stableford&mode=stableford-stats",
      ["Coollattin Stableford Live"],
    ],
    ["?event=vilasol&mode=stroke-stats", ["Coollattin Stableford Live"]],
  ] as const) {
    expectRouteHeadings(route, headings);
  }

  expectRouteHeadings("?event=stag2026&mode=captain&team=invalid", [
    "Choose a valid team",
  ]);

  expectRouteHeadings(
    "?event=coollattin-stableford&mode=stableford",
    ["My Stableford Scorecard"],
    "sam",
  );
});

test("shows an empty visitor board before scoring begins", () => {
  resetBrowserState();
  const { container, host, unmount } = renderRoute("?event=stag2026&mode=home");

  try {
    expect(
      within(container).getByText(/No live scores yet\./u),
    ).toHaveTextContent("This board will update when players begin scoring.");
  } finally {
    unmount();
    host.remove();
    resetBrowserState();
  }
});

test("shows only Coollattin UI on the Stableford home", () => {
  resetBrowserState();
  const { container, host, unmount } = renderRoute(
    "?event=coollattin-stableford&mode=home",
  );
  const page = within(container);

  try {
    expect(
      page.getByRole("heading", {
        name: "Coollattin Individual Stableford",
      }),
    ).toBeInTheDocument();
    expect(
      page.getByRole("heading", { name: "Stableford Player Login" }),
    ).toBeInTheDocument();
    expect(
      page.queryByRole("heading", { name: "Coollattin Stableford Live" }),
    ).not.toBeInTheDocument();
    expect(
      page.queryByRole("heading", { name: "Team Login" }),
    ).not.toBeInTheDocument();
    expect(
      page.queryByRole("heading", { name: "Pub Golf Live" }),
    ).not.toBeInTheDocument();
    expect(
      page.queryByRole("heading", { name: "Vila Sol Scramble Live" }),
    ).not.toBeInTheDocument();
    expect(
      page.queryByRole("heading", { name: "Overall Event Standings" }),
    ).not.toBeInTheDocument();
  } finally {
    unmount();
    host.remove();
    resetBrowserState();
  }
});

test("persists Stableford login and supports logout", async () => {
  resetBrowserState();
  const assignedUrls: (string | URL)[] = [];
  const assign = spyOn(locationPrototype, "assign").mockImplementation(
    (url) => {
      assignedUrls.push(url);
    },
  );
  const user = userEvent.setup();
  const { container, host, unmount } = renderRoute(
    "?event=coollattin-stableford&mode=stableford",
  );
  const page = within(container);

  try {
    await user.type(page.getByLabelText("Username"), "sam");
    await user.type(page.getByLabelText("Password"), "sam");
    await user.click(page.getByRole("button", { name: "Open My Scorecard" }));

    expect(
      await page.findByRole("heading", { name: "My Stableford Scorecard" }),
    ).toBeInTheDocument();
    expect(
      globalThis.localStorage.getItem(STABLEFORD_IDENTITY_STORAGE_KEY),
    ).toBe(JSON.stringify("sam"));
    expect(assignedUrls).toEqual([
      "?event=coollattin-stableford&mode=stableford",
    ]);

    await user.click(page.getByRole("button", { name: "Log out" }));
    expect(
      page.getByRole("heading", { name: "Stableford Player Login" }),
    ).toBeInTheDocument();
    expect(
      globalThis.localStorage.getItem(STABLEFORD_IDENTITY_STORAGE_KEY),
    ).toBeNull();
  } finally {
    unmount();
    host.remove();
    assign.mockRestore();
    resetBrowserState();
  }
});

test("home resumes and clears a persisted Stableford session", async () => {
  resetBrowserState();
  globalThis.localStorage.setItem(
    STABLEFORD_IDENTITY_STORAGE_KEY,
    JSON.stringify("sam"),
  );
  const user = userEvent.setup();
  const { container, host, unmount } = renderRoute("?mode=home");
  const page = within(container);

  try {
    expect(
      page.getByRole("heading", { name: "Continue as Sam" }),
    ).toBeInTheDocument();
    expect(
      page.getByRole("link", { name: "Open My Scorecard" }),
    ).toHaveAttribute("href", "?event=coollattin-stableford&mode=stableford");
    expect(
      page.queryByRole("heading", { name: "Stableford Player Login" }),
    ).not.toBeInTheDocument();

    await user.click(
      page.getByRole("button", { name: "Log out of Stableford" }),
    );
    expect(
      page.getByRole("heading", { name: "Stableford Player Login" }),
    ).toBeInTheDocument();
  } finally {
    unmount();
    host.remove();
    resetBrowserState();
  }
});
