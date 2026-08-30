import { expect, test } from "bun:test";

import { render, screen } from "@testing-library/react";

import { PubGolfLeaderboard } from "./PubGolfLeaderboard";
import { scoreKey } from "./scoring";

import type { PubState } from "../../state/eventState";
import type { TeamNames } from "../../state/golfState";

const TEAM_NAMES: TeamNames = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
};

const ONE_HOLE_STATE: PubState = {
  locks: {},
  penalties: {},
  scores: {
    [scoreKey("a1", "h1")]: 2,
    [scoreKey("a2", "h1")]: 3,
    [scoreKey("a3", "h1")]: 99,
    [scoreKey("b1", "h1")]: 4,
    [scoreKey("b2", "h1")]: 4,
    [scoreKey("b3", "h1")]: 99,
    [scoreKey("c1", "h1")]: 3,
    [scoreKey("c2", "h1")]: 3,
    [scoreKey("c3", "h1")]: 99,
  },
};

test("shows every team ordered by its best-two standing", () => {
  const { unmount } = render(
    <PubGolfLeaderboard state={ONE_HOLE_STATE} teamNames={TEAM_NAMES} />,
  );

  expect(
    screen.getByText("Best 2 scores count on each completed hole."),
  ).toBeInTheDocument();
  expect(
    screen
      .getAllByText(/^(Alpha|Bravo|Charlie)$/)
      .map((element) => element.textContent),
  ).toEqual(["Alpha", "Charlie", "Bravo"]);
  expect(screen.getByText("-1")).toBeInTheDocument();
  expect(screen.getByText("E")).toBeInTheDocument();
  expect(screen.getByText("+2")).toBeInTheDocument();
  expect(screen.getAllByText("1 holes")).toHaveLength(3);
  unmount();
});
