import { BeerSteinIcon } from "@phosphor-icons/react/BeerStein";

import { getPubTeamStandings } from "./scoring";
import { Panel } from "../../components/Panel";
import { SectionHeading } from "../../components/SectionHeading";
import { PUB_EVENT } from "../../config/pubGolf";

import type { PubState } from "../../state/eventState";
import type { TeamNames } from "../../state/golfState";
import type { Icon } from "@phosphor-icons/react";

interface PubGolfLeaderboardProperties {
  icon?: Icon;
  state: PubState;
  teamNames: TeamNames;
  title?: string;
}

const formatToPar = (value: number): string => {
  if (value === 0) {
    return "E";
  }
  return value > 0 ? `+${String(value)}` : String(value);
};

export const PubGolfLeaderboard = ({
  icon = BeerSteinIcon,
  state,
  teamNames,
  title = "Pub Golf Live",
}: PubGolfLeaderboardProperties) => {
  const standings = getPubTeamStandings(state);

  return (
    <Panel>
      <div>
        <SectionHeading icon={icon} title={title} />
        <p className="text-sm text-base-content/70">
          Best 2 scores count on each completed hole.
        </p>
      </div>
      <div className="grid gap-2">
        {standings.map((standing, index) => (
          <div
            className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-box border border-base-300 bg-base-200 p-3"
            key={standing.teamId}
          >
            <span className="font-bold tabular-nums">{index + 1}</span>
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
      <p className="text-xs text-base-content/60">
        {PUB_EVENT.holes.length} Pub Golf holes configured.
      </p>
    </Panel>
  );
};
