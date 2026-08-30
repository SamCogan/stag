import { BeerSteinIcon } from "@phosphor-icons/react/BeerStein";

import { getPenaltyCounts, getPenaltyPoints, scoreKey } from "./scoring";
import { Panel } from "../../components/Panel";
import { PlayerHeadshot } from "../../components/PlayerHeadshot";
import { PubPenaltyIcon } from "../../components/PubPenaltyIcon";
import { ScoreStepper } from "../../components/ScoreStepper";
import { SectionHeading } from "../../components/SectionHeading";
import { PUB_EVENT, PUB_PENALTIES } from "../../config/pubGolf";

import type { PubGolfActions } from "./usePubGolfStore";
import type { Player, PubHole, TeamId } from "../../config/eventSchemas";
import type { PubState } from "../../state/eventState";

interface PubGolfScorecardProperties {
  actions: PubGolfActions;
  canEdit: boolean;
  state: PubState;
  teamId: TeamId;
  teamName: string;
}

interface PubHoleCardProperties {
  actions: PubGolfActions;
  canEdit: boolean;
  hole: PubHole;
  player: Player;
  state: PubState;
}

const PubHoleCard = ({
  actions,
  canEdit,
  hole,
  player,
  state,
}: PubHoleCardProperties) => {
  const key = scoreKey(player.id, hole.id);
  const score = state.scores[key] ?? hole.par;
  const penaltyCounts = getPenaltyCounts(state.penalties, player.id, hole.id);
  const disabled = !canEdit || state.locks[hole.id] === true;
  const penaltyPoints = getPenaltyPoints(penaltyCounts);

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <strong>{hole.name}</strong>
          <p className="text-xs text-base-content/65">
            {hole.pub} | Par {hole.par}
          </p>
        </div>
        {state.locks[hole.id] === true && (
          <span className="badge badge-sm badge-warning">Locked</span>
        )}
      </div>
      <ScoreStepper
        ariaLabel={`${player.name}, ${hole.name}`}
        disabled={disabled}
        onChange={(value) => {
          void actions.setScore(player.id, hole.id, value);
        }}
        value={score}
      />
      <div className="mt-2 flex flex-wrap gap-1">
        {PUB_PENALTIES.map((penalty) => {
          const active = (penaltyCounts[penalty.id] ?? 0) > 0;
          return (
            <button
              aria-pressed={active}
              className={
                active ? "btn btn-warning btn-xs" : "btn btn-ghost btn-xs"
              }
              disabled={disabled}
              key={penalty.id}
              onClick={() => {
                void actions.togglePenalty(player.id, hole.id, penalty.id);
              }}
              type="button"
            >
              <PubPenaltyIcon penaltyId={penalty.id} />
              {penalty.label}
            </button>
          );
        })}
      </div>
      {penaltyPoints > 0 && (
        <p className="mt-2 text-xs font-semibold text-warning">
          +{penaltyPoints} penalty
        </p>
      )}
    </div>
  );
};

interface PubPlayerCardProperties {
  actions: PubGolfActions;
  canEdit: boolean;
  player: Player;
  state: PubState;
}

const PubPlayerCard = ({
  actions,
  canEdit,
  player,
  state,
}: PubPlayerCardProperties) => (
  <article className="card border border-base-300 bg-base-200">
    <div className="card-body gap-3 p-3">
      <div className="flex items-center gap-3">
        <PlayerHeadshot
          image={player.image}
          initials={player.name.slice(0, 2)}
          name={player.name}
        />
        <h3 className="card-title">{player.name}</h3>
      </div>
      <div className="grid gap-3">
        {PUB_EVENT.holes.map((hole) => (
          <PubHoleCard
            actions={actions}
            canEdit={canEdit}
            hole={hole}
            key={hole.id}
            player={player}
            state={state}
          />
        ))}
      </div>
    </div>
  </article>
);

export const PubGolfScorecard = ({
  actions,
  canEdit,
  state,
  teamId,
  teamName,
}: PubGolfScorecardProperties) => {
  const team = PUB_EVENT.teams[teamId];

  return (
    <Panel>
      <div>
        <SectionHeading icon={BeerSteinIcon} title="Pub Golf Scoring" />
        <p className="text-sm text-base-content/70">
          Team: {teamName} |{" "}
          {canEdit ? "Edit enabled" : "Read only (wrong password)"}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {team.players.map((player) => (
          <PubPlayerCard
            actions={actions}
            canEdit={canEdit}
            key={player.id}
            player={player}
            state={state}
          />
        ))}
      </div>
    </Panel>
  );
};
