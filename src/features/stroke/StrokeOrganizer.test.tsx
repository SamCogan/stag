import { expect, mock, test } from "bun:test";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { strokeScoreKey } from "./scoring";
import { StrokeOrganizer } from "./StrokeOrganizer";
import { PUB_EVENT } from "../../config/pubGolf";

import type { StrokeActions } from "./useStrokeStore";
import type { StrokeState } from "../../state/golfState";
import type { ScrambleActions } from "../scramble/useScrambleStore";

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

const requireElement = <ElementType,>(
  element: ElementType | undefined,
): ElementType => {
  if (element === undefined) {
    throw new Error("Expected rendered control");
  }

  return element;
};

test("updates handicaps, selected loops, and hole locks", async () => {
  const actions = createActions();
  const setLoopCombination = mock<ScrambleActions["setLoopCombination"]>(() =>
    Promise.resolve(),
  );
  const state: StrokeState = {
    ...EMPTY_STATE,
    handicaps: { a1: 12 },
    locks: { v1: true },
  };
  const user = userEvent.setup();

  const { unmount } = render(
    <StrokeOrganizer
      actions={actions}
      loopActions={{ setLoopCombination }}
      loopCombination="Out+Mid"
      state={state}
    />,
  );

  const loopField = screen.getByRole<HTMLSelectElement>("combobox", {
    name: "Course nines",
  });
  expect(loopField).toHaveValue("Out+Mid");
  await user.selectOptions(loopField, "Out+In");

  const handicapField = requireElement(
    screen
      .getAllByRole<HTMLInputElement>("spinbutton", {
        name: "Playing handicap",
      })
      .at(0),
  );
  expect(handicapField).toHaveValue(12);
  await user.clear(handicapField);
  await user.type(handicapField, "18");
  await user.tab();

  const lockButton = screen.getByRole("button", { name: "Hole 1: Locked" });
  expect(lockButton).toHaveAttribute("aria-pressed", "true");
  await user.click(lockButton);

  expect(setLoopCombination).toHaveBeenCalledWith("Out+In");
  expect(actions.setHandicap).toHaveBeenCalledWith("a1", 18);
  expect(actions.toggleLock).toHaveBeenCalledWith("v1");

  unmount();
});

test("shows every player and supports organizer score correction", async () => {
  const actions = createActions();
  const state: StrokeState = {
    ...EMPTY_STATE,
    scores: { [strokeScoreKey("a1", "v10")]: 4 },
  };
  const user = userEvent.setup();

  const { unmount } = render(
    <StrokeOrganizer
      actions={actions}
      loopActions={{
        setLoopCombination: mock<ScrambleActions["setLoopCombination"]>(() =>
          Promise.resolve(),
        ),
      }}
      loopCombination="Mid+In"
      state={state}
    />,
  );

  for (const team of Object.values(PUB_EVENT.teams)) {
    for (const player of team.players) {
      expect(screen.getByText(player.name)).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: player.name }),
      ).toBeInTheDocument();
    }
  }

  expect(screen.getByRole("spinbutton", { name: "Paul, hole 10" })).toHaveValue(
    4,
  );
  expect(
    screen.queryByRole("spinbutton", { name: "Paul, hole 1" }),
  ).not.toBeInTheDocument();

  await user.click(
    screen.getByRole("button", { name: "Increase Paul, hole 10" }),
  );

  expect(actions.setScore).toHaveBeenCalledWith("a1", "v10", 5);
  unmount();
});

test("requires confirmation before resetting Stroke scores", async () => {
  const actions = createActions();
  const user = userEvent.setup();

  const { unmount } = render(
    <StrokeOrganizer
      actions={actions}
      loopActions={{
        setLoopCombination: mock<ScrambleActions["setLoopCombination"]>(() =>
          Promise.resolve(),
        ),
      }}
      loopCombination="Out+Mid"
      state={EMPTY_STATE}
    />,
  );

  await user.click(screen.getByRole("button", { name: "Reset Scores" }));
  const dialog = screen.getByRole("alertdialog");
  expect(actions.resetScores).not.toHaveBeenCalled();

  await user.click(
    within(dialog).getByRole("button", { name: "Reset Stroke Scores" }),
  );

  expect(actions.resetScores).toHaveBeenCalledTimes(1);
  unmount();
});
