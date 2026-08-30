import { expect, test } from "bun:test";

import { render, screen } from "@testing-library/react";

import { strokeScoreKey } from "./scoring";
import { StrokeLeaderboard } from "./StrokeLeaderboard";

import type { StrokeState, TeamNames } from "../../state/golfState";

const TEAM_NAMES: TeamNames = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
};

const requireElement = <ElementType,>(
  element: ElementType | undefined,
): ElementType => {
  if (element === undefined) {
    throw new Error("Expected rendered element");
  }

  return element;
};

test("shows team and individual live standings for the selected loops", () => {
  const state: StrokeState = {
    handicaps: {},
    locks: {},
    scores: {
      [strokeScoreKey("a1", "v1")]: 4,
      [strokeScoreKey("a2", "v1")]: 6,
      [strokeScoreKey("a3", "v1")]: 7,
      [strokeScoreKey("b1", "v1")]: 3,
      [strokeScoreKey("b2", "v1")]: 4,
      [strokeScoreKey("b3", "v1")]: 5,
      [strokeScoreKey("c1", "v1")]: 8,
      [strokeScoreKey("c2", "v1")]: 8,
      [strokeScoreKey("c3", "v1")]: 8,
      [strokeScoreKey("b1", "v10")]: 1,
    },
  };

  const { unmount } = render(
    <StrokeLeaderboard
      loopCombination="Out+In"
      state={state}
      teamNames={TEAM_NAMES}
    />,
  );

  expect(
    screen
      .getAllByRole("heading", { level: 3 })
      .map((element) => element.textContent),
  ).toEqual(["Bravo", "Alpha", "Charlie"]);
  expect(screen.getByText("Net 7")).toBeInTheDocument();
  expect(screen.getByText("Net to par: -1")).toBeInTheDocument();
  expect(screen.getByText("Net 10")).toBeInTheDocument();
  expect(screen.getByText("Net to par: +2")).toBeInTheDocument();
  expect(screen.getByText("Net 16")).toBeInTheDocument();
  expect(screen.getByText("Net to par: +8")).toBeInTheDocument();

  const playerPhotos = screen.getAllByRole("img");
  expect(playerPhotos).toHaveLength(9);
  expect(requireElement(playerPhotos.at(0))).toHaveAttribute("alt", "Ste");
  expect(screen.getByText("1")).toBeInTheDocument();
  expect(screen.getAllByText("Bravo | 1 holes")).toHaveLength(3);
  expect(screen.getByText("-1")).toBeInTheDocument();
  expect(screen.getAllByText(/\| 1 holes$/u)).toHaveLength(9);

  unmount();
});
