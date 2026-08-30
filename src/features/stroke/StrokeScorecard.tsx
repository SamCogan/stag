import { GolfIcon } from "@phosphor-icons/react/Golf";

import { getNetScore, strokeScoreKey } from "./scoring";
import { Panel } from "../../components/Panel";
import { PlayerHeadshot } from "../../components/PlayerHeadshot";
import { ScoreStepper } from "../../components/ScoreStepper";
import { SectionHeading } from "../../components/SectionHeading";
import { PUB_EVENT } from "../../config/pubGolf";
import { getVilaSolHoles } from "../../config/vilaSol";

import type { StrokeActions } from "./useStrokeStore";
import type { Player, TeamId, VilaSolHole } from "../../config/eventSchemas";
import type { VilaSolLoopCombination } from "../../config/vilaSol";
import type { StrokeState } from "../../state/golfState";

interface StrokePlayerCardProperties {
  actions: StrokeActions;
  canEdit: boolean;
  holes: readonly VilaSolHole[];
  player: Player;
  state: StrokeState;
}

const StrokePlayerCard = ({
  actions,
  canEdit,
  holes,
  player,
  state,
}: StrokePlayerCardProperties) => {
  const handicap = state.handicaps[player.id] ?? 0;

  return (
    <article className="card border border-base-300 bg-base-200">
      <div className="card-body gap-3 p-3">
        <div className="flex items-center gap-3">
          <PlayerHeadshot
            image={player.image}
            initials={player.name.slice(0, 2)}
            name={player.name}
          />
          <div>
            <h3 className="card-title">{player.name}</h3>
            <p className="text-xs">Handicap {handicap}</p>
          </div>
        </div>
        {holes.map((hole) => {
          const gross = state.scores[strokeScoreKey(player.id, hole.id)];
          const disabled = !canEdit || state.locks[hole.id] === true;
          return (
            <div
              className="rounded-box border border-base-300 bg-base-100 p-3"
              key={hole.id}
            >
              <div className="mb-2 flex items-center justify-between">
                <strong>Hole {hole.number}</strong>
                <span className="text-xs">
                  Par {hole.par} | SI {hole.si}
                </span>
              </div>
              <ScoreStepper
                ariaLabel={`${player.name}, hole ${String(hole.number)}`}
                disabled={disabled}
                onChange={(value) => {
                  void actions.setScore(player.id, hole.id, value);
                }}
                value={gross ?? hole.par}
              />
              <p className="mt-2 text-sm">
                Net:{" "}
                {gross === undefined
                  ? "—"
                  : getNetScore(gross, handicap, hole.si)}
              </p>
            </div>
          );
        })}
      </div>
    </article>
  );
};

interface StrokeScorecardProperties {
  actions: StrokeActions;
  canEdit: boolean;
  loopCombination: VilaSolLoopCombination;
  state: StrokeState;
  teamId: TeamId;
  teamName: string;
}

export const StrokeScorecard = ({
  actions,
  canEdit,
  loopCombination,
  state,
  teamId,
  teamName,
}: StrokeScorecardProperties) => {
  const holes = getVilaSolHoles(loopCombination);

  return (
    <Panel>
      <div>
        <SectionHeading icon={GolfIcon} title="Stroke Play - Vila Sol" />
        <p className="text-sm text-base-content/70">
          Team: {teamName} |{" "}
          {canEdit ? "Edit enabled" : "Read only (wrong password)"}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {PUB_EVENT.teams[teamId].players.map((player) => (
          <StrokePlayerCard
            actions={actions}
            canEdit={canEdit}
            holes={holes}
            key={player.id}
            player={player}
            state={state}
          />
        ))}
      </div>
    </Panel>
  );
};
