import { expect, test } from "bun:test";

import { render, screen } from "@testing-library/react";

import { PubGolfStats } from "./PubGolfStats";
import { scoreKey } from "./scoring";
import { PUB_EVENT } from "../../config/pubGolf";

import type { PubState } from "../../state/eventState";
import type { TeamNames } from "../../state/golfState";

const SCORED_STATE: PubState = {
  locks: {},
  penalties: {},
  scores: {
    [scoreKey("a1", "h1")]: 2,
  },
};

const TEAM_NAMES: TeamNames = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
};

test("renders every player across all Pub Golf teams", () => {
  const { unmount } = render(
    <PubGolfStats state={SCORED_STATE} teamNames={TEAM_NAMES} />,
  );

  for (const team of Object.values(PUB_EVENT.teams)) {
    for (const player of team.players) {
      expect(screen.getByText(player.name)).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: player.name }),
      ).toBeInTheDocument();
    }
  }

  expect(screen.getAllByRole("img")).toHaveLength(9);
  expect(
    screen.getAllByText(/^(Alpha|Bravo|Charlie) \| [01] holes$/),
  ).toHaveLength(9);
  unmount();
});
