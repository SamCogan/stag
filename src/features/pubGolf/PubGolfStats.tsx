import { ChartLineUpIcon } from "@phosphor-icons/react/ChartLineUp";

import { getPlayerHoleTotal } from "./scoring";
import { Panel } from "../../components/Panel";
import { PlayerHeadshot } from "../../components/PlayerHeadshot";
import { SectionHeading } from "../../components/SectionHeading";
import { PUB_EVENT } from "../../config/pubGolf";

import type { PubState } from "../../state/eventState";
import type { TeamNames } from "../../state/golfState";

interface PubGolfStatsProperties {
  state: PubState;
  teamNames: TeamNames;
}

export const PubGolfStats = ({ state, teamNames }: PubGolfStatsProperties) => {
  const players = Object.entries(PUB_EVENT.teams)
    .flatMap(([teamId, team]) =>
      team.players.map((player) => {
        const results = PUB_EVENT.holes.flatMap((hole) => {
          const total = getPlayerHoleTotal(state, player.id, hole);
          return total === undefined ? [] : [{ hole, total }];
        });
        const total = results.reduce((sum, result) => sum + result.total, 0);
        const par = results.reduce((sum, result) => sum + result.hole.par, 0);
        return {
          enteredHoles: results.length,
          image: player.image,
          name: player.name,
          teamId: teamId as keyof TeamNames,
          toPar: total - par,
          total,
        };
      }),
    )
    .toSorted((left, right) => left.toPar - right.toPar);

  return (
    <Panel>
      <div>
        <SectionHeading icon={ChartLineUpIcon} title="Pub Golf Stats" />
        <p className="text-sm text-base-content/70">
          Individual gross totals include recorded penalties.
        </p>
      </div>
      <div className="grid gap-2">
        {players.map((player, index) => (
          <div
            className="grid grid-cols-[2rem_auto_1fr_auto] items-center gap-3 rounded-box border border-base-300 bg-base-200 p-3"
            key={`${player.teamId}-${player.name}`}
          >
            <span className="font-bold tabular-nums">{index + 1}</span>
            <PlayerHeadshot
              image={player.image}
              initials={player.name.slice(0, 2)}
              name={player.name}
              size="small"
            />
            <div>
              <strong>{player.name}</strong>
              <p className="text-xs text-base-content/65">
                {teamNames[player.teamId]} | {player.enteredHoles} holes
              </p>
            </div>
            <strong className="tabular-nums">
              {player.total} ({player.toPar >= 0 ? "+" : ""}
              {player.toPar})
            </strong>
          </div>
        ))}
      </div>
    </Panel>
  );
};
