import { RankingIcon } from "@phosphor-icons/react/Ranking";

import { STABLEFORD_CONFIG } from "./config";
import { formatHoles, formatPoints } from "./formatting";
import { getStablefordLeaderboard } from "./scoring";
import { StablefordLiveScorecard } from "./StablefordLiveScorecard";
import { Panel } from "../../components/Panel";
import { PlayerHeadshot } from "../../components/PlayerHeadshot";
import { SectionHeading } from "../../components/SectionHeading";

import type { StablefordState } from "./state";

interface StablefordLeaderboardProperties {
  state: StablefordState;
}

export const StablefordLeaderboard = ({
  state,
}: StablefordLeaderboardProperties) => {
  const standings = getStablefordLeaderboard(state);

  return (
    <Panel>
      <div>
        <SectionHeading icon={RankingIcon} title="Coollattin Stableford Live" />
        <p className="text-sm text-base-content/70">
          {STABLEFORD_CONFIG.courseName} | {STABLEFORD_CONFIG.teeName}
        </p>
      </div>
      <StablefordLiveScorecard standings={standings} state={state} />
      <div aria-label="Stableford standings" className="grid gap-2" role="list">
        {standings.map((standing) => {
          const groupId = state.groups[standing.player.id];
          const groupName =
            groupId === undefined ? "Unassigned" : state.groupNames[groupId];

          return (
            <div
              className="grid grid-cols-[2rem_auto_minmax(0,1fr)] items-center gap-3 rounded-box border border-base-300 bg-base-200 p-3 sm:grid-cols-[2rem_auto_minmax(0,1fr)_auto]"
              key={standing.player.id}
              role="listitem"
            >
              <strong className="tabular-nums">{standing.position}</strong>
              <PlayerHeadshot
                initials={standing.player.initials}
                name={standing.player.name}
                size="small"
              />
              <div>
                <strong>{standing.player.name}</strong>
                <p className="text-xs text-base-content/65">
                  {groupName} | HC {standing.handicap} |{" "}
                  {formatHoles(standing.holesCompleted)}
                </p>
              </div>
              <div className="col-span-2 col-start-2 mt-1 flex items-center justify-between border-t border-base-300 pt-2 sm:col-span-1 sm:col-start-auto sm:mt-0 sm:block sm:border-0 sm:pt-0 sm:text-right">
                <strong className="block text-lg tabular-nums">
                  {formatPoints(standing.totalPoints)}
                </strong>
                <span className="text-xs text-base-content/65">
                  F {standing.frontNinePoints} | B {standing.backNinePoints}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};
