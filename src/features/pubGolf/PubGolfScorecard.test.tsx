import { expect, mock, test } from "bun:test";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PubGolfScorecard } from "./PubGolfScorecard";
import { scoreKey } from "./scoring";
import { PUB_EVENT } from "../../config/pubGolf";

import type { PubGolfActions } from "./usePubGolfStore";
import type { PubState } from "../../state/eventState";

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

const EMPTY_STATE: PubState = {
  locks: {},
  penalties: {},
  scores: {},
};

const createActions = () => ({
  setScore: mock<PubGolfActions["setScore"]>(() => Promise.resolve()),
  toggleLock: mock<PubGolfActions["toggleLock"]>(() => Promise.resolve()),
  togglePenalty: mock<PubGolfActions["togglePenalty"]>(() => Promise.resolve()),
});

const requireElement = <ElementType,>(
  element: ElementType | undefined,
): ElementType => {
  if (element === undefined) {
    throw new Error("Expected rendered control");
  }

  return element;
};

test("renders the selected team roster, photos, and all 18 holes", () => {
  const actions = createActions();
  const team = PUB_EVENT.teams.B;

  const { unmount } = render(
    <PubGolfScorecard
      actions={actions}
      canEdit
      state={EMPTY_STATE}
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
        name: new RegExp(`^${player.name},`),
      }),
    ).toHaveLength(PUB_EVENT.holes.length);
  }

  for (const hole of PUB_EVENT.holes) {
    expect(
      screen.getAllByText(`${hole.pub} | Par ${String(hole.par)}`),
    ).toHaveLength(team.players.length);
  }

  unmount();
});

test("allows score and penalty editing when editing is enabled", async () => {
  const actions = createActions();
  const state: PubState = {
    ...EMPTY_STATE,
    scores: { [scoreKey("a1", "h17")]: 3 },
  };
  const user = userEvent.setup();

  const { unmount } = render(
    <PubGolfScorecard
      actions={actions}
      canEdit
      state={state}
      teamId="A"
      teamName="Editable Team"
    />,
  );

  const scoreInput = screen.getByRole<HTMLInputElement>("spinbutton", {
    name: "Paul, Choice Drink (light)",
  });
  await user.type(scoreInput, "5", {
    initialSelectionEnd: 1,
    initialSelectionStart: 0,
  });
  await user.click(
    screen.getByRole("button", {
      name: "Increase Paul, Choice Drink (light)",
    }),
  );
  await user.click(
    screen.getByRole("button", {
      name: "Decrease Paul, Choice Drink (light)",
    }),
  );
  await user.click(
    requireElement(screen.getAllByRole("button", { name: "Spill" }).at(0)),
  );

  expect(actions.setScore).toHaveBeenNthCalledWith(1, "a1", "h17", 5);
  expect(actions.setScore).toHaveBeenNthCalledWith(2, "a1", "h17", 4);
  expect(actions.setScore).toHaveBeenNthCalledWith(3, "a1", "h17", 2);
  expect(actions.togglePenalty).toHaveBeenCalledWith("a1", "h1", "spill");
  unmount();
});

test("disables every score and penalty control when editing is unavailable", () => {
  const { unmount } = render(
    <PubGolfScorecard
      actions={createActions()}
      canEdit={false}
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

test("disables controls for locked holes while leaving other holes editable", () => {
  const state: PubState = {
    ...EMPTY_STATE,
    locks: { h17: true },
  };

  const { unmount } = render(
    <PubGolfScorecard
      actions={createActions()}
      canEdit
      state={state}
      teamId="A"
      teamName="Partially Locked Team"
    />,
  );

  expect(
    screen.getByRole("spinbutton", {
      name: "Paul, Choice Drink (light)",
    }),
  ).toBeDisabled();
  expect(
    screen.getByRole("button", {
      name: "Increase Paul, Choice Drink (light)",
    }),
  ).toBeDisabled();
  expect(
    requireElement(screen.getAllByRole("button", { name: "Spill" }).at(16)),
  ).toBeDisabled();
  expect(
    requireElement(
      screen
        .getAllByRole("spinbutton", {
          name: "Paul, Pint Beer / Long Drink",
        })
        .at(0),
    ),
  ).toBeEnabled();
  unmount();
});
