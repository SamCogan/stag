import { expect, test } from "bun:test";

import { render, screen, within } from "@testing-library/react";

import { stablefordScoreKey } from "./scoring";
import { StablefordLeaderboard } from "./StablefordLeaderboard";
import { EMPTY_STABLEFORD_STATE } from "./state";

test("shows every player with live Stableford totals and groups", () => {
  const state = {
    ...EMPTY_STABLEFORD_STATE,
    pickups: { [stablefordScoreKey("kyle", "1")]: true },
    scores: { [stablefordScoreKey("sam", "1")]: 7 },
  };
  const { unmount } = render(<StablefordLeaderboard state={state} />);
  const standings = screen.getByRole("list", {
    name: "Stableford standings",
  });
  const scorecard = screen.getByRole("table", {
    name: "Coollattin Stableford live scorecard",
  });

  expect(
    screen.getByRole("heading", { name: "Coollattin Stableford Live" }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("img")).toHaveLength(12);
  expect(
    within(standings).getAllByText("Group A | HC 32 | 1 hole"),
  ).toHaveLength(2);
  expect(within(standings).getByText("1 pt")).toBeInTheDocument();
  expect(within(standings).getAllByText("0 pts")).toHaveLength(11);
  expect(within(scorecard).getAllByRole("row")).toHaveLength(13);
  expect(
    within(scorecard).getByRole("columnheader", {
      name: "Hole 18, par 3",
    }),
  ).toBeInTheDocument();
  expect(
    within(scorecard).getByLabelText("Sam, hole 1: gross 7, net 5, 1 point"),
  ).toHaveTextContent("7");
  expect(
    within(scorecard).getByLabelText("Kyle, hole 1: picked up, 0 points"),
  ).toHaveTextContent("P");

  unmount();
});
