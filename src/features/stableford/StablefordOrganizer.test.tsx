import { expect, mock, test } from "bun:test";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { stablefordScoreKey } from "./scoring";
import { StablefordOrganizer } from "./StablefordOrganizer";
import { EMPTY_STABLEFORD_STATE } from "./state";

import type { OrganizerActions } from "./useStablefordStore";

const createActions = () => ({
  clearHole: mock<OrganizerActions["clearHole"]>(() => Promise.resolve()),
  markPickup: mock<OrganizerActions["markPickup"]>(() => Promise.resolve()),
  resetEvent: mock<OrganizerActions["resetEvent"]>(() => Promise.resolve()),
  setGroup: mock<OrganizerActions["setGroup"]>(() => Promise.resolve()),
  setGroupName: mock<OrganizerActions["setGroupName"]>(() => Promise.resolve()),
  setHandicap: mock<OrganizerActions["setHandicap"]>(() => Promise.resolve()),
  setScore: mock<OrganizerActions["setScore"]>(() => Promise.resolve()),
  toggleLock: mock<OrganizerActions["toggleLock"]>(() => Promise.resolve()),
});

test("updates group names, assignments, and handicaps with validation", async () => {
  const actions = createActions();
  const state = {
    ...EMPTY_STABLEFORD_STATE,
    groups: { ...EMPTY_STABLEFORD_STATE.groups, sam: "B" as const },
  };
  const user = userEvent.setup();
  const { unmount } = render(
    <StablefordOrganizer actions={actions} state={state} />,
  );

  expect(screen.getByRole("alert")).toHaveTextContent(
    "Current counts: A 3, B 5, C 4.",
  );
  await user.selectOptions(screen.getByLabelText("Sam group"), "A");

  const handicap = screen.getByLabelText("Sam handicap");
  await user.clear(handicap);
  await user.type(handicap, "31");
  await user.tab();

  const groupName = screen.getByLabelText("Group A name");
  await user.clear(groupName);
  await user.type(groupName, "Early Birds");
  await user.tab();

  expect(actions.setGroup).toHaveBeenCalledWith("sam", "A");
  expect(actions.setHandicap).toHaveBeenCalledWith("sam", 31);
  expect(actions.setGroupName).toHaveBeenCalledWith("A", "Early Birds");

  unmount();
});

test("refreshes group names and handicaps from synchronized state", () => {
  const actions = createActions();
  const { rerender, unmount } = render(
    <StablefordOrganizer actions={actions} state={EMPTY_STABLEFORD_STATE} />,
  );

  expect(screen.getByLabelText("Group A name")).toHaveValue("Group A");
  expect(screen.getByLabelText("Sam handicap")).toHaveValue(32);

  rerender(
    <StablefordOrganizer
      actions={actions}
      state={{
        ...EMPTY_STABLEFORD_STATE,
        groupNames: {
          ...EMPTY_STABLEFORD_STATE.groupNames,
          A: "First Tee",
        },
        handicaps: {
          ...EMPTY_STABLEFORD_STATE.handicaps,
          sam: 31,
        },
      }}
    />,
  );

  expect(screen.getByLabelText("Group A name")).toHaveValue("First Tee");
  expect(screen.getByLabelText("Sam handicap")).toHaveValue(31);

  unmount();
});

test("edits every player's scores, pickups, clears, and hole locks", async () => {
  const actions = createActions();
  const state = {
    ...EMPTY_STABLEFORD_STATE,
    locks: { "1": true },
    pickups: { [stablefordScoreKey("sam", "2")]: true },
    scores: { [stablefordScoreKey("sam", "3")]: 5 },
  };
  const user = userEvent.setup();
  const { unmount } = render(
    <StablefordOrganizer actions={actions} state={state} />,
  );

  const playerSelect = screen.getByRole<HTMLSelectElement>("combobox", {
    name: "Player to edit",
  });
  expect(within(playerSelect).getAllByRole("option")).toHaveLength(12);
  expect(screen.getByLabelText("Gross score for hole 3")).toHaveValue(5);
  expect(screen.getByText("3 pts through 2 holes")).toBeInTheDocument();
  expect(screen.getAllByText("Sam receives 2 shots")).toHaveLength(14);

  await user.click(screen.getByRole("button", { name: "Hole 1: Locked" }));
  await user.click(
    screen.getByRole("button", { name: "Increase score for hole 3" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Pick up for 0 points on hole 4" }),
  );
  await user.click(screen.getByRole("button", { name: "Clear hole 3" }));
  await user.selectOptions(playerSelect, "kyle");

  expect(actions.toggleLock).toHaveBeenCalledWith("1");
  expect(actions.setScore).toHaveBeenCalledWith("sam", "3", 6);
  expect(actions.markPickup).toHaveBeenCalledWith("sam", "4");
  expect(actions.clearHole).toHaveBeenCalledWith("sam", "3");
  expect(screen.getByRole("heading", { name: "Kyle" })).toBeInTheDocument();

  unmount();
});

test("requires confirmation before resetting only Stableford", async () => {
  const actions = createActions();
  const user = userEvent.setup();
  const { unmount } = render(
    <StablefordOrganizer actions={actions} state={EMPTY_STABLEFORD_STATE} />,
  );

  await user.click(screen.getByRole("button", { name: /^Reset Stableford$/u }));
  const dialog = screen.getByRole("alertdialog");
  expect(actions.resetEvent).not.toHaveBeenCalled();

  await user.click(
    within(dialog).getByRole("button", {
      name: /^Reset Stableford$/u,
    }),
  );
  expect(actions.resetEvent).toHaveBeenCalledTimes(1);

  unmount();
});
