import { expect, mock, test } from "bun:test";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { STABLEFORD_CONFIG } from "./config";
import { stablefordScoreKey } from "./scoring";
import { StablefordScorecard } from "./StablefordScorecard";
import { EMPTY_STABLEFORD_STATE } from "./state";

import type { PlayerScoreActions } from "./useStablefordStore";

const SAM = STABLEFORD_CONFIG.players.find((player) => player.id === "sam");
if (SAM === undefined) {
  throw new Error("Stableford fixture is missing Sam");
}

const createActions = () => ({
  clearHole: mock<PlayerScoreActions["clearHole"]>(() => Promise.resolve()),
  markPickup: mock<PlayerScoreActions["markPickup"]>(() => Promise.resolve()),
  setScore: mock<PlayerScoreActions["setScore"]>(() => Promise.resolve()),
});

test("renders scores, pickups, totals, and locked-hole controls", () => {
  const state = {
    ...EMPTY_STABLEFORD_STATE,
    locks: { "3": true },
    pickups: { [stablefordScoreKey(SAM.id, "2")]: true },
    scores: { [stablefordScoreKey(SAM.id, "1")]: 7 },
  };
  const { unmount } = render(
    <StablefordScorecard
      actions={createActions()}
      onLogout={() => false}
      player={SAM}
      state={state}
    />,
  );

  expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(18);
  expect(screen.getByLabelText("Front nine points")).toHaveTextContent("1");
  expect(screen.getByLabelText("Holes completed")).toHaveTextContent("2/18");
  expect(
    screen.getByRole("spinbutton", { name: "Gross score for hole 1" }),
  ).toHaveValue(7);
  expect(
    screen.getByRole("button", {
      name: "Pick up for 0 points on hole 2",
      pressed: true,
    }),
  ).toBeInTheDocument();
  expect(screen.getAllByText("You receive 2 shots")).toHaveLength(14);
  expect(screen.getByText("1 pt")).toBeInTheDocument();
  expect(
    screen.getByText("Coollattin Golf Club | Men's White Tees"),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("spinbutton", { name: "Gross score for hole 3" }),
  ).toBeDisabled();
  expect(
    screen.getByText("This hole is locked by the organizer."),
  ).toBeInTheDocument();
  expect(screen.queryByText(/Signed in as/u)).not.toBeInTheDocument();

  unmount();
});

test("supports step entry, pickup, clear, failure feedback, and logout", async () => {
  const actions = createActions();
  actions.markPickup.mockImplementationOnce(() =>
    Promise.reject(new Error("Scoring is closed")),
  );
  const onLogout = mock(() => true);
  const state = {
    ...EMPTY_STABLEFORD_STATE,
    scores: { [stablefordScoreKey(SAM.id, "1")]: 7 },
  };
  const user = userEvent.setup();
  const { unmount } = render(
    <StablefordScorecard
      actions={actions}
      onLogout={onLogout}
      player={SAM}
      state={state}
    />,
  );

  await user.click(
    screen.getByRole("button", { name: "Increase score for hole 1" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Decrease score for hole 1" }),
  );
  const directInput = screen.getByRole("spinbutton", {
    name: "Gross score for hole 1",
  });
  await user.clear(directInput);
  await user.type(directInput, "9");
  await user.tab();
  await user.click(
    screen.getByRole("button", {
      name: "Pick up for 0 points on hole 2",
    }),
  );
  expect(await screen.findByText("Scoring is closed")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Clear hole 1" }));
  await user.click(screen.getByRole("button", { name: "Log out" }));

  expect(actions.setScore.mock.calls).toEqual([
    ["1", 8],
    ["1", 6],
    ["1", 9],
  ]);
  expect(actions.markPickup).toHaveBeenCalledWith("2");
  expect(actions.clearHole).toHaveBeenCalledWith("1");
  expect(onLogout).toHaveBeenCalledTimes(1);

  unmount();
});

test("applies step actions to a pending direct score without losing taps", async () => {
  const actions = createActions();
  const state = {
    ...EMPTY_STABLEFORD_STATE,
    scores: { [stablefordScoreKey(SAM.id, "1")]: 1 },
  };
  const user = userEvent.setup();
  const { unmount } = render(
    <StablefordScorecard
      actions={actions}
      onLogout={() => true}
      player={SAM}
      state={state}
    />,
  );
  const directInput = screen.getByRole("spinbutton", {
    name: "Gross score for hole 1",
  });

  await user.clear(directInput);
  await user.type(directInput, "9");
  await user.click(
    screen.getByRole("button", { name: "Increase score for hole 1" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Decrease score for hole 1" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Increase score for hole 2" }),
  );

  expect(actions.setScore.mock.calls).toEqual([
    ["1", 10],
    ["1", 8],
    ["2", 4],
  ]);

  unmount();
});
