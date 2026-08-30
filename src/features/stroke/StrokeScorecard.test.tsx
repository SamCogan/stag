import { expect, mock, test } from "bun:test";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { strokeScoreKey } from "./scoring";
import { StrokeScorecard } from "./StrokeScorecard";
import { PUB_EVENT } from "../../config/pubGolf";

import type { StrokeActions } from "./useStrokeStore";
import type { StrokeState } from "../../state/golfState";

declare module "bun:test" {
  interface Matchers<T> {
    toBeDisabled(this: Matchers<T>): void;
    toBeEnabled(this: Matchers<T>): void;
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

const EMPTY_STATE: StrokeState = {
  handicaps: {},
  locks: {},
  scores: {},
};

const createActions = () => ({
  resetScores: mock<StrokeActions["resetScores"]>(() => Promise.resolve()),
  setHandicap: mock<StrokeActions["setHandicap"]>(() => Promise.resolve()),
  setScore: mock<StrokeActions["setScore"]>(() => Promise.resolve()),
  toggleLock: mock<StrokeActions["toggleLock"]>(() => Promise.resolve()),
});

test("renders the selected loops, team roster, gross controls, and net score", () => {
  const team = PUB_EVENT.teams.B;
  const state: StrokeState = {
    ...EMPTY_STATE,
    handicaps: { b1: 5 },
    scores: { [strokeScoreKey("b1", "v1")]: 6 },
  };

  const { unmount } = render(
    <StrokeScorecard
      actions={createActions()}
      canEdit
      loopCombination="Out+In"
      state={state}
      teamId="B"
      teamName="Test Team B"
    />,
  );

  expect(
    screen.getByText("Team: Test Team B | Edit enabled"),
  ).toBeInTheDocument();

  for (const player of team.players) {
    expect(
      screen.getByRole("heading", { name: player.name }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: player.name })).toHaveAttribute(
      "src",
      player.image,
    );
    expect(
      screen.getAllByRole("spinbutton", {
        name: new RegExp(`^${player.name}, hole`, "u"),
      }),
    ).toHaveLength(18);
  }

  expect(screen.getByRole("spinbutton", { name: "Ste, hole 1" })).toHaveValue(
    6,
  );
  expect(screen.getByText("Net: 5")).toBeInTheDocument();
  expect(
    screen.getByRole("spinbutton", { name: "Ste, hole 19" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("spinbutton", { name: "Ste, hole 10" }),
  ).not.toBeInTheDocument();

  unmount();
});

test("submits gross score corrections through the selected player's controls", async () => {
  const actions = createActions();
  const state: StrokeState = {
    ...EMPTY_STATE,
    scores: { [strokeScoreKey("a1", "v1")]: 4 },
  };
  const user = userEvent.setup();

  const { unmount } = render(
    <StrokeScorecard
      actions={actions}
      canEdit
      loopCombination="Out+Mid"
      state={state}
      teamId="A"
      teamName="Editable Team"
    />,
  );

  await user.click(
    screen.getByRole("button", { name: "Increase Paul, hole 1" }),
  );

  expect(actions.setScore).toHaveBeenCalledWith("a1", "v1", 5);
  unmount();
});

test("disables every gross score control in read-only mode", () => {
  const { unmount } = render(
    <StrokeScorecard
      actions={createActions()}
      canEdit={false}
      loopCombination="Out+Mid"
      state={EMPTY_STATE}
      teamId="A"
      teamName="Read-only Team"
    />,
  );

  expect(
    screen.getByText("Team: Read-only Team | Read only (wrong password)"),
  ).toBeInTheDocument();
  expect(
    screen
      .getAllByRole<HTMLInputElement>("spinbutton")
      .every((control) => control.disabled),
  ).toBe(true);
  expect(
    screen
      .getAllByRole<HTMLButtonElement>("button")
      .every((control) => control.disabled),
  ).toBe(true);

  unmount();
});

test("disables a locked hole while leaving other holes editable", () => {
  const state: StrokeState = {
    ...EMPTY_STATE,
    locks: { v1: true },
  };

  const { unmount } = render(
    <StrokeScorecard
      actions={createActions()}
      canEdit
      loopCombination="Out+Mid"
      state={state}
      teamId="A"
      teamName="Partially Locked Team"
    />,
  );

  expect(
    screen.getByRole("spinbutton", { name: "Paul, hole 1" }),
  ).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Increase Paul, hole 1" }),
  ).toBeDisabled();
  expect(
    screen.getByRole("spinbutton", { name: "Paul, hole 2" }),
  ).toBeEnabled();
  expect(
    screen.getByRole("button", { name: "Increase Paul, hole 2" }),
  ).toBeEnabled();

  unmount();
});
