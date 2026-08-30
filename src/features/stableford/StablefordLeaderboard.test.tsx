import { expect, test } from "bun:test";

import { render, screen } from "@testing-library/react";

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

  expect(
    screen.getByRole("heading", { name: "Coollattin Stableford Live" }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("img")).toHaveLength(12);
  expect(screen.getAllByText("Group A | HC 32 | 1 hole")).toHaveLength(2);
  expect(screen.getByText("1 pt")).toBeInTheDocument();
  expect(screen.getAllByText("0 pts")).toHaveLength(11);

  unmount();
});
