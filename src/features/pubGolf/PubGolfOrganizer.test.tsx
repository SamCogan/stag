import { expect, mock, test } from "bun:test";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PubGolfOrganizer } from "./PubGolfOrganizer";
import { scoreKey } from "./scoring";
import { PUB_EVENT } from "../../config/pubGolf";

import type { PubGolfActions } from "./usePubGolfStore";
import type { PubState } from "../../state/eventState";
import type { TeamNames } from "../../state/golfState";
import type { ScrambleActions } from "../scramble/useScrambleStore";

const TEAM_NAMES: TeamNames = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
};

const EDIT_STATE: PubState = {
  locks: { h2: true },
  penalties: {
    [scoreKey("a1", "h1")]: { spill: 1 },
  },
  scores: {
    [scoreKey("a1", "h1")]: 4,
  },
};

const createActions = () => ({
  setScore: mock<PubGolfActions["setScore"]>(() => Promise.resolve()),
  toggleLock: mock<PubGolfActions["toggleLock"]>(() => Promise.resolve()),
  togglePenalty: mock<PubGolfActions["togglePenalty"]>(() => Promise.resolve()),
});

test("exposes editable team names and lock controls", async () => {
  const actions = createActions();
  const setTeamName = mock<ScrambleActions["setTeamName"]>(() =>
    Promise.resolve(),
  );
  const user = userEvent.setup();

  const { unmount } = render(
    <PubGolfOrganizer
      actions={actions}
      state={EDIT_STATE}
      teamActions={{ setTeamName }}
      teamNames={TEAM_NAMES}
    />,
  );

  const teamNameField = screen.getByRole<HTMLInputElement>("textbox", {
    name: "Team A name",
  });
  expect(teamNameField).toHaveValue("Alpha");

  await user.clear(teamNameField);
  await user.type(teamNameField, "Renamed Alpha");
  await user.tab();
  await user.click(screen.getByRole("button", { name: "Hole 1: Unlocked" }));

  expect(setTeamName).toHaveBeenCalledWith("A", "Renamed Alpha");
  expect(actions.toggleLock).toHaveBeenCalledWith("h1");
  expect(
    screen.getByRole("button", { name: "Hole 2: Locked" }),
  ).toHaveAttribute("aria-pressed", "true");
  unmount();
});

test("shows every player and supports score and penalty corrections", async () => {
  const actions = createActions();
  const user = userEvent.setup();

  const { unmount } = render(
    <PubGolfOrganizer
      actions={actions}
      state={EDIT_STATE}
      teamActions={{
        setTeamName: mock<ScrambleActions["setTeamName"]>(() =>
          Promise.resolve(),
        ),
      }}
      teamNames={TEAM_NAMES}
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

  expect(
    screen.getByRole("spinbutton", {
      name: "Paul, hole 1",
    }),
  ).toHaveValue(4);

  await user.click(
    screen.getByRole("button", { name: "Increase Paul, hole 1" }),
  );
  const activePenalty = screen.getByRole("button", {
    name: "Spill for Paul, hole 1",
  });
  expect(activePenalty).toHaveAttribute("aria-pressed", "true");
  await user.click(activePenalty);

  expect(actions.setScore).toHaveBeenCalledWith("a1", "h1", 5);
  expect(actions.togglePenalty).toHaveBeenCalledWith("a1", "h1", "spill");
  unmount();
});
