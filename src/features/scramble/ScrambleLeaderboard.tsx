import { FlagPennantIcon } from "@phosphor-icons/react/FlagPennant";

import { getScrambleStandings } from "./scoring";
import { Panel } from "../../components/Panel";
import { SectionHeading } from "../../components/SectionHeading";
import { getVilaSolHoles } from "../../config/vilaSol";

import type { VilaSolLoopCombination } from "../../config/vilaSol";
import type { ScrambleState, TeamNames } from "../../state/golfState";

interface ScrambleLeaderboardProperties {
  loopCombination: VilaSolLoopCombination;
  state: ScrambleState;
  teamNames: TeamNames;
}

const formatToPar = (value: number): string => {
  if (value === 0) {
    return "E";
  }
  return value > 0 ? `+${String(value)}` : String(value);
};

export const ScrambleLeaderboard = ({
  loopCombination,
  state,
  teamNames,
}: ScrambleLeaderboardProperties) => {
  const holes = getVilaSolHoles(loopCombination);
  const standings = getScrambleStandings(state, holes);

  return (
    <Panel>
      <div>
        <SectionHeading icon={FlagPennantIcon} title="Vila Sol Scramble Live" />
        <p className="text-sm text-base-content/70">
          Current nines: {loopCombination} | Par{" "}
          {holes.reduce((total, hole) => total + hole.par, 0)}
        </p>
      </div>
      <div className="grid gap-2">
        {standings.map((standing, index) => (
          <div
            className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-box border border-base-300 bg-base-200 p-3"
            key={standing.teamId}
          >
            <span className="font-bold">{index + 1}</span>
            <div>
              <strong>{teamNames[standing.teamId]}</strong>
              <p className="text-xs text-base-content/65">
                {standing.holesCompleted} holes
              </p>
            </div>
            <strong className="tabular-nums">
              {standing.holesCompleted === 0
                ? "—"
                : formatToPar(standing.toPar)}
            </strong>
          </div>
        ))}
      </div>
    </Panel>
  );
};
