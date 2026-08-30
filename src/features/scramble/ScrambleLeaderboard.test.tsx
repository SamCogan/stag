import { expect, test } from "bun:test";

import { render, screen } from "@testing-library/react";

import { scrambleScoreKey } from "./scoring";
import { ScrambleLeaderboard } from "./ScrambleLeaderboard";

import type { ScrambleState, TeamNames } from "../../state/golfState";

declare module "bun:test" {
  interface Matchers<T> {
    toBeInTheDocument(this: Matchers<T>): void;
  }
}

const TEAM_NAMES: TeamNames = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
};

test("shows the selected nines, par, and every live team row in standing order", () => {
  const state: ScrambleState = {
    drives: {},
    locks: {},
    scores: {
      [scrambleScoreKey("A", "v1")]: 4,
      [scrambleScoreKey("B", "v1")]: 6,
      [scrambleScoreKey("C", "v1")]: 3,
    },
  };

  const { unmount } = render(
    <ScrambleLeaderboard
      loopCombination="Out+In"
      state={state}
      teamNames={TEAM_NAMES}
    />,
  );

  expect(
    screen.getByText("Current nines: Out+In | Par 72"),
  ).toBeInTheDocument();
  expect(
    screen
      .getAllByText(/^(Alpha|Bravo|Charlie)$/u)
      .map((element) => element.textContent),
  ).toEqual(["Charlie", "Alpha", "Bravo"]);
  expect(screen.getAllByText("1 holes")).toHaveLength(3);
  expect(screen.getByText("-1")).toBeInTheDocument();
  expect(screen.getByText("E")).toBeInTheDocument();
  expect(screen.getByText("+2")).toBeInTheDocument();

  unmount();
});
