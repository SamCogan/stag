import { expect, mock, test } from "bun:test";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { scrambleScoreKey } from "./scoring";
import { ScrambleOrganizer } from "./ScrambleOrganizer";

import type { ScrambleActions } from "./useScrambleStore";
import type { ScrambleState, TeamNames } from "../../state/golfState";

declare module "bun:test" {
  interface Matchers<T> {
    toHaveAttribute(
      this: Matchers<T>,
      name: string,
      value?: string | RegExp,
    ): void;
    toHaveValue(
      this: Matchers<T>,
      value?: string | readonly string[] | number,
    ): void;
  }
}

const TEAM_NAMES: TeamNames = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
};

const EMPTY_STATE: ScrambleState = {
  drives: {},
  locks: {},
  scores: {},
};

const createActions = () => ({
  resetScores: mock<ScrambleActions["resetScores"]>(() => Promise.resolve()),
  setDrive: mock<ScrambleActions["setDrive"]>(() => Promise.resolve()),
  setLoopCombination: mock<ScrambleActions["setLoopCombination"]>(() =>
    Promise.resolve(),
  ),
  setScore: mock<ScrambleActions["setScore"]>(() => Promise.resolve()),
  setTeamName: mock<ScrambleActions["setTeamName"]>(() => Promise.resolve()),
  toggleLock: mock<ScrambleActions["toggleLock"]>(() => Promise.resolve()),
});

test("updates the loop, team name, and hole lock", async () => {
  const actions = createActions();
  const state: ScrambleState = {
    ...EMPTY_STATE,
    locks: { v1: true },
  };
  const user = userEvent.setup();

  const { unmount } = render(
    <ScrambleOrganizer
      actions={actions}
      loopCombination="Out+Mid"
      state={state}
      teamNames={TEAM_NAMES}
    />,
  );

  const loopField = screen.getByRole<HTMLSelectElement>("combobox", {
    name: "Course nines",
  });
  expect(loopField).toHaveValue("Out+Mid");
  await user.selectOptions(loopField, "Out+In");

  const teamNameField = screen.getByRole<HTMLInputElement>("textbox", {
    name: "Team A name",
  });
  expect(teamNameField).toHaveValue("Alpha");
  await user.clear(teamNameField);
  await user.type(teamNameField, "Renamed Alpha");
  await user.tab();

  const unlockButton = screen.getByRole("button", { name: "Unlock" });
  expect(unlockButton).toHaveAttribute("aria-pressed", "true");
  await user.click(unlockButton);

  expect(actions.setLoopCombination).toHaveBeenCalledWith("Out+In");
  expect(actions.setTeamName).toHaveBeenCalledWith("A", "Renamed Alpha");
  expect(actions.toggleLock).toHaveBeenCalledWith("v1");

  unmount();
});

test("supports organizer score and selected-drive corrections", async () => {
  const actions = createActions();
  const state: ScrambleState = {
    ...EMPTY_STATE,
    drives: { [scrambleScoreKey("A", "v1")]: "a2" },
    scores: { [scrambleScoreKey("A", "v1")]: 4 },
  };
  const user = userEvent.setup();

  const { unmount } = render(
    <ScrambleOrganizer
      actions={actions}
      loopCombination="Out+Mid"
      state={state}
      teamNames={TEAM_NAMES}
    />,
  );

  expect(screen.getByRole("spinbutton", { name: "Alpha, hole 1" })).toHaveValue(
    4,
  );
  expect(
    screen.getByRole("button", {
      name: "Select Andy's drive for Alpha, hole 1",
    }),
  ).toHaveAttribute("aria-pressed", "true");

  await user.click(
    screen.getByRole("button", { name: "Increase Alpha, hole 1" }),
  );
  await user.click(
    screen.getByRole("button", {
      name: "Select Paul's drive for Alpha, hole 1",
    }),
  );

  expect(actions.setScore).toHaveBeenCalledWith("A", "v1", 5);
  expect(actions.setDrive).toHaveBeenCalledWith("A", "v1", "a1");

  unmount();
});

test("requires confirmation before resetting scramble data", async () => {
  const actions = createActions();
  const user = userEvent.setup();

  const { unmount } = render(
    <ScrambleOrganizer
      actions={actions}
      loopCombination="Mid+In"
      state={EMPTY_STATE}
      teamNames={TEAM_NAMES}
    />,
  );

  await user.click(screen.getByRole("button", { name: "Reset Scramble" }));
  const dialog = screen.getByRole("alertdialog");
  expect(actions.resetScores).not.toHaveBeenCalled();

  await user.click(
    within(dialog).getByRole("button", { name: "Reset Scramble" }),
  );

  expect(actions.resetScores).toHaveBeenCalledTimes(1);

  unmount();
});
