import { GolfIcon } from "@phosphor-icons/react/Golf";
import { MedalIcon } from "@phosphor-icons/react/Medal";

import { getNetScore, getStrokeTeamStandings, strokeScoreKey } from "./scoring";
import { Panel } from "../../components/Panel";
import { PlayerHeadshot } from "../../components/PlayerHeadshot";
import { SectionHeading } from "../../components/SectionHeading";
import { PUB_EVENT } from "../../config/pubGolf";
import { getVilaSolHoles } from "../../config/vilaSol";

import type { VilaSolLoopCombination } from "../../config/vilaSol";
import type { StrokeState, TeamNames } from "../../state/golfState";

interface StrokeLeaderboardProperties {
  loopCombination: VilaSolLoopCombination;
  state: StrokeState;
  teamNames: TeamNames;
}

const formatToPar = (value: number): string => {
  if (value === 0) {
    return "E";
  }
  return value > 0 ? `+${String(value)}` : String(value);
};

export const StrokeLeaderboard = ({
  loopCombination,
  state,
  teamNames,
}: StrokeLeaderboardProperties) => {
  const holes = getVilaSolHoles(loopCombination);
  const teams = getStrokeTeamStandings(state, holes);
  const players = Object.entries(PUB_EVENT.teams)
    .flatMap(([teamId, team]) =>
      team.players.map((player) => {
        const completed = holes.flatMap((hole) => {
          const gross = state.scores[strokeScoreKey(player.id, hole.id)];
          return gross === undefined ? [] : [{ gross, hole }];
        });
        const net = completed.reduce(
          (total, entry) =>
            total +
            getNetScore(
              entry.gross,
              state.handicaps[player.id] ?? 0,
              entry.hole.si,
            ),
          0,
        );
        const par = completed.reduce(
          (total, entry) => total + entry.hole.par,
          0,
        );
        return {
          ...player,
          holesCompleted: completed.length,
          net,
          netToPar: net - par,
          teamId: teamId as keyof TeamNames,
        };
      }),
    )
    .toSorted(
      (left, right) => left.netToPar - right.netToPar || left.net - right.net,
    );

  return (
    <>
      <Panel>
        <SectionHeading icon={GolfIcon} title="Vila Sol Stroke Live" />
        <div className="grid gap-3 sm:grid-cols-3">
          {teams.map((team) => (
            <article
              className="card border border-base-300 bg-base-200"
              key={team.teamId}
            >
              <div className="card-body gap-1 p-4">
                <h3 className="card-title">{teamNames[team.teamId]}</h3>
                <p>Net {team.net}</p>
                <strong>
                  Net to par:{" "}
                  {team.netToPar === undefined
                    ? "—"
                    : formatToPar(team.netToPar)}
                </strong>
              </div>
            </article>
          ))}
        </div>
      </Panel>
      <Panel>
        <SectionHeading icon={MedalIcon} title="Top Net Players" />
        <div className="grid gap-2">
          {players.map((player, index) => (
            <div
              className="grid grid-cols-[2rem_auto_1fr_auto] items-center gap-3 rounded-box border border-base-300 bg-base-200 p-3"
              key={player.id}
            >
              <span>{index + 1}</span>
              <PlayerHeadshot
                image={player.image}
                initials={player.name.slice(0, 2)}
                name={player.name}
                size="small"
              />
              <div>
                <strong>{player.name}</strong>
                <p className="text-xs">
                  {teamNames[player.teamId]} | {player.holesCompleted} holes
                </p>
              </div>
              <strong>
                {player.holesCompleted === 0
                  ? "—"
                  : formatToPar(player.netToPar)}
              </strong>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
};
