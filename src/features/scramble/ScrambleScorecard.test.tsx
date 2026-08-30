import { expect, mock, test } from "bun:test";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { scrambleScoreKey } from "./scoring";
import { ScrambleScorecard } from "./ScrambleScorecard";
import { PUB_EVENT } from "../../config/pubGolf";

import type { ScrambleActions } from "./useScrambleStore";
import type { ScrambleState } from "../../state/golfState";

declare module "bun:test" {
  interface Matchers<T> {
    toBeDisabled(this: Matchers<T>): void;
    toBeEnabled(this: Matchers<T>): void;
    toBeInTheDocument(this: Matchers<T>): void;
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

const requireElement = <ElementType,>(
  element: ElementType | undefined,
): ElementType => {
  if (element === undefined) {
    throw new Error("Expected rendered control");
  }

  return element;
};

test("renders the selected loop, team photos, and all 18 holes", () => {
  const team = PUB_EVENT.teams.B;

  const { unmount } = render(
    <ScrambleScorecard
      actions={createActions()}
      canEdit
      loopCombination="Out+In"
      state={EMPTY_STATE}
      teamId="B"
      teamName="Test Team B"
    />,
  );

  expect(screen.getByText("Par 72 [Out+In nines]")).toBeInTheDocument();
  expect(
    screen.getByText("Team: Test Team B | Edit enabled"),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(18);

  for (const player of team.players) {
    const photos = screen.getAllByRole("img", { name: player.name });
    expect(photos).toHaveLength(18);
    expect(requireElement(photos.at(0))).toHaveAttribute("src", player.image);
  }

  unmount();
});

test("calls score and drive actions for the selected team and hole", async () => {
  const actions = createActions();
  const state: ScrambleState = {
    ...EMPTY_STATE,
    drives: { [scrambleScoreKey("B", "v1")]: "b2" },
    scores: { [scrambleScoreKey("B", "v1")]: 4 },
  };
  const user = userEvent.setup();

  const { unmount } = render(
    <ScrambleScorecard
      actions={actions}
      canEdit
      loopCombination="Out+Mid"
      state={state}
      teamId="B"
      teamName="Editable Team"
    />,
  );

  expect(
    screen.getByRole("spinbutton", { name: "Editable Team, hole 1" }),
  ).toHaveValue(4);
  expect(
    requireElement(screen.getAllByRole("button", { name: /Sam/u }).at(0)),
  ).toHaveAttribute("aria-pressed", "true");

  await user.click(
    screen.getByRole("button", {
      name: "Increase Editable Team, hole 1",
    }),
  );
  await user.click(
    requireElement(screen.getAllByRole("button", { name: /Ste/u }).at(0)),
  );

  expect(actions.setScore).toHaveBeenCalledWith("B", "v1", 5);
  expect(actions.setDrive).toHaveBeenCalledWith("B", "v1", "b1");

  unmount();
});

test("disables every score and drive control in read-only mode", () => {
  const { unmount } = render(
    <ScrambleScorecard
      actions={createActions()}
      canEdit={false}
      loopCombination="Out+Mid"
      state={EMPTY_STATE}
      teamId="A"
      teamName="Read-only Team"
    />,
  );

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

test("disables a locked hole while leaving the remaining holes editable", () => {
  const state: ScrambleState = {
    ...EMPTY_STATE,
    locks: { v1: true },
  };

  const { unmount } = render(
    <ScrambleScorecard
      actions={createActions()}
      canEdit
      loopCombination="Out+Mid"
      state={state}
      teamId="A"
      teamName="Partially Locked Team"
    />,
  );

  expect(
    screen.getByRole("spinbutton", {
      name: "Partially Locked Team, hole 1",
    }),
  ).toBeDisabled();
  expect(
    screen.getByRole("button", {
      name: "Increase Partially Locked Team, hole 1",
    }),
  ).toBeDisabled();
  expect(
    requireElement(screen.getAllByRole("button", { name: /Paul/u }).at(0)),
  ).toBeDisabled();
  expect(
    screen.getByRole("spinbutton", {
      name: "Partially Locked Team, hole 2",
    }),
  ).toBeEnabled();
  expect(
    requireElement(screen.getAllByRole("button", { name: /Paul/u }).at(1)),
  ).toBeEnabled();
  expect(screen.getByText("Locked")).toBeInTheDocument();

  unmount();
});
