import { expect, test } from "bun:test";

import { render, screen } from "@testing-library/react";

import { OverallStandings } from "./OverallStandings";
import { EMPTY_PUB_STATE } from "../state/eventState";
import { EMPTY_SCRAMBLE_STATE, EMPTY_STROKE_STATE } from "../state/golfState";

import type { TeamNames } from "../state/golfState";

const TEAM_NAMES: TeamNames = {
  A: "Alphas",
  B: "Bravos",
  C: "Charlies",
};

test("shows negative, even, and positive combined standings", () => {
  const { unmount } = render(
    <OverallStandings
      loopCombination="Out+Mid"
      pubState={EMPTY_PUB_STATE}
      scrambleState={{
        drives: {},
        locks: {},
        scores: {
          "A::v1": 3,
          "B::v1": 4,
          "C::v1": 5,
        },
      }}
      strokeState={EMPTY_STROKE_STATE}
      teamNames={TEAM_NAMES}
    />,
  );

  expect(
    screen
      .getAllByText(/^(Alphas|Bravos|Charlies)$/)
      .map((element) => element.textContent),
  ).toEqual(["Alphas", "Bravos", "Charlies"]);
  expect(screen.getByText("-1")).toBeInTheDocument();
  expect(screen.getByText("E")).toBeInTheDocument();
  expect(screen.getByText("+1")).toBeInTheDocument();

  unmount();
});

test("shows an empty message before scoring starts", () => {
  const { unmount } = render(
    <OverallStandings
      loopCombination="Out+Mid"
      pubState={EMPTY_PUB_STATE}
      scrambleState={EMPTY_SCRAMBLE_STATE}
      strokeState={EMPTY_STROKE_STATE}
      teamNames={TEAM_NAMES}
    />,
  );

  expect(
    screen.getByText(
      "No scores entered yet. Combined standings will appear once scoring starts.",
    ),
  ).toBeInTheDocument();
  expect(screen.queryByText("Alphas")).not.toBeInTheDocument();

  unmount();
});
