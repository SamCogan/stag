import { expect, spyOn, test } from "bun:test";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TeamLogin } from "./TeamLogin";

declare module "bun:test" {
  interface Matchers<T> {
    toBeInTheDocument(this: Matchers<T>): void;
    toHaveTextContent(this: Matchers<T>, expected: string | RegExp): void;
  }
}

const locationPrototype = Object.getPrototypeOf(globalThis.location) as Pick<
  Location,
  "assign"
>;

const mockLocationAssign = () => {
  const assignedUrls: (string | URL)[] = [];
  const assign = spyOn(locationPrototype, "assign").mockImplementation(
    (url) => {
      assignedUrls.push(url);
    },
  );

  return { assign, assignedUrls };
};

test("offers the two team-based activities", () => {
  const { unmount } = render(<TeamLogin />);

  const activitySelect = screen.getByRole<HTMLSelectElement>("combobox", {
    name: "Game Type",
  });
  const options =
    within(activitySelect).getAllByRole<HTMLOptionElement>("option");

  expect(
    options.map(({ textContent, value }) => ({ label: textContent, value })),
  ).toEqual([
    { label: "Pub Golf", value: "pub" },
    { label: "Vila Sol Scramble", value: "scramble" },
  ]);
  unmount();
});

test.each([
  [
    "Pub Golf",
    {
      activity: "pub",
      expectedRoute: "?event=stag2026&key=team1ONE&mode=captain&team=A",
      password: "team1ONE",
      teamId: "A",
    },
  ],
  [
    "Vila Sol Scramble",
    {
      activity: "scramble",
      expectedRoute: "?event=vilasol&key=TEAM2two&mode=scramble&team=B",
      password: "TEAM2two",
      teamId: "B",
    },
  ],
] as const)(
  "uses the selected team's deployed credential for %s navigation",
  async (_activityLabel, { activity, expectedRoute, password, teamId }) => {
    const { assign, assignedUrls } = mockLocationAssign();
    const user = userEvent.setup();
    const { unmount } = render(<TeamLogin />);

    try {
      await user.selectOptions(
        screen.getByRole("combobox", { name: "Game Type" }),
        activity,
      );
      await user.selectOptions(
        screen.getByRole("combobox", { name: "Team" }),
        teamId,
      );
      await user.type(screen.getByLabelText("Team Password"), password);
      await user.click(
        screen.getByRole("button", { name: "Open Team Scoring" }),
      );

      expect(assign).toHaveBeenCalledTimes(1);
      expect(assignedUrls).toEqual([expectedRoute]);
    } finally {
      unmount();
      assign.mockRestore();
    }
  },
);

test("shows an error and does not navigate for the wrong team password", async () => {
  const { assign, assignedUrls } = mockLocationAssign();
  const user = userEvent.setup();
  const { unmount } = render(<TeamLogin />);

  try {
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Team" }),
      "B",
    );
    await user.type(screen.getByLabelText("Team Password"), "team1ONE");
    await user.click(screen.getByRole("button", { name: "Open Team Scoring" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Wrong team password.");
    expect(assign).not.toHaveBeenCalled();
    expect(assignedUrls).toHaveLength(0);
  } finally {
    unmount();
    assign.mockRestore();
  }
});
