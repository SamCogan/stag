import { RankingIcon } from "@phosphor-icons/react/Ranking";

import { Panel } from "./Panel";
import { SectionHeading } from "./SectionHeading";
import { getVilaSolHoles } from "../config/vilaSol";
import { getPubTeamStandings } from "../features/pubGolf/scoring";
import { getScrambleStandings } from "../features/scramble/scoring";

import type { VilaSolLoopCombination } from "../config/vilaSol";
import type { PubState } from "../state/eventState";
import type { ScrambleState, TeamNames } from "../state/golfState";

interface OverallStandingsProperties {
  loopCombination: VilaSolLoopCombination;
  pubState: PubState;
  scrambleState: ScrambleState;
  teamNames: TeamNames;
}

const formatToPar = (value: number): string => {
  if (value === 0) {
    return "E";
  }
  return value > 0 ? `+${String(value)}` : String(value);
};

export const OverallStandings = ({
  loopCombination,
  pubState,
  scrambleState,
  teamNames,
}: OverallStandingsProperties) => {
  const holes = getVilaSolHoles(loopCombination);
  const pub = Object.fromEntries(
    getPubTeamStandings(pubState).map((entry) => [entry.teamId, entry]),
  );
  const scramble = Object.fromEntries(
    getScrambleStandings(scrambleState, holes).map((entry) => [
      entry.teamId,
      entry,
    ]),
  );
  const hasScores =
    Object.keys(pubState.scores).length > 0 ||
    Object.keys(scrambleState.scores).length > 0;
  const standings = (["A", "B", "C"] as const)
    .map((teamId) => ({
      teamId,
      total: (pub[teamId]?.toPar ?? 0) + (scramble[teamId]?.toPar ?? 0),
    }))
    .toSorted((left, right) => left.total - right.total);

  return (
    <Panel>
      <div>
        <SectionHeading icon={RankingIcon} title="Overall Event Standings" />
        <p className="text-sm text-base-content/70">
          Combined shots to par across Pub Golf and Vila Sol Scramble.
        </p>
      </div>
      {hasScores ? (
        <div className="grid gap-2">
          {standings.map((standing, index) => (
            <div
              className="grid grid-cols-[2rem_1fr_auto] rounded-box border border-base-300 bg-base-200 p-3"
              key={standing.teamId}
            >
              <span>{index + 1}</span>
              <strong>{teamNames[standing.teamId]}</strong>
              <strong>{formatToPar(standing.total)}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-base-content/70">
          No scores entered yet. Combined standings will appear once scoring
          starts.
        </p>
      )}
    </Panel>
  );
};
