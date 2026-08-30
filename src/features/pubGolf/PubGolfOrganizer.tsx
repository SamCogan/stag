import { BeerSteinIcon } from "@phosphor-icons/react/BeerStein";
import { LockIcon } from "@phosphor-icons/react/Lock";
import { LockOpenIcon } from "@phosphor-icons/react/LockOpen";

import { getPenaltyCounts, scoreKey } from "./scoring";
import { Panel } from "../../components/Panel";
import { PlayerHeadshot } from "../../components/PlayerHeadshot";
import { PubPenaltyIcon } from "../../components/PubPenaltyIcon";
import { ScoreStepper } from "../../components/ScoreStepper";
import { SectionHeading } from "../../components/SectionHeading";
import { PUB_EVENT, PUB_PENALTIES } from "../../config/pubGolf";

import type { PubGolfActions } from "./usePubGolfStore";
import type { Player, TeamId } from "../../config/eventSchemas";
import type { PubState } from "../../state/eventState";
import type { TeamNames } from "../../state/golfState";
import type { ScrambleActions } from "../scramble/useScrambleStore";

interface PlayerEditorProperties {
  actions: PubGolfActions;
  player: Player;
  state: PubState;
}

const PlayerEditor = ({ actions, player, state }: PlayerEditorProperties) => (
  <details className="collapse-arrow collapse border border-base-300 bg-base-100">
    <summary className="collapse-title flex items-center gap-3 font-semibold">
      <PlayerHeadshot
        image={player.image}
        initials={player.name.slice(0, 2)}
        name={player.name}
        size="small"
      />
      {player.name}
    </summary>
    <div className="collapse-content grid gap-3">
      {PUB_EVENT.holes.map((hole) => {
        const key = scoreKey(player.id, hole.id);
        const penalties = getPenaltyCounts(state.penalties, player.id, hole.id);
        return (
          <div className="rounded-box border border-base-300 p-3" key={hole.id}>
            <div className="mb-2 flex items-center justify-between">
              <strong>Hole {hole.id.slice(1)}</strong>
              <span className="text-xs">Par {hole.par}</span>
            </div>
            <ScoreStepper
              ariaLabel={`${player.name}, hole ${hole.id.slice(1)}`}
              onChange={(value) => {
                void actions.setScore(player.id, hole.id, value);
              }}
              value={state.scores[key] ?? hole.par}
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {PUB_PENALTIES.map((penalty) => (
                <button
                  aria-label={`${penalty.label} for ${player.name}, hole ${hole.id.slice(1)}`}
                  aria-pressed={(penalties[penalty.id] ?? 0) > 0}
                  className="btn btn-ghost btn-xs"
                  key={penalty.id}
                  onClick={() => {
                    void actions.togglePenalty(player.id, hole.id, penalty.id);
                  }}
                  type="button"
                >
                  <PubPenaltyIcon penaltyId={penalty.id} />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </details>
);

interface TeamEditorProperties {
  actions: PubGolfActions;
  state: PubState;
  teamId: TeamId;
  teamName: string;
}

const TeamEditor = ({
  actions,
  state,
  teamId,
  teamName,
}: TeamEditorProperties) => (
  <article className="card border border-base-300 bg-base-200">
    <div className="card-body gap-4 p-3 sm:p-4">
      <h3 className="card-title">{teamName}</h3>
      {PUB_EVENT.teams[teamId].players.map((player) => (
        <PlayerEditor
          actions={actions}
          key={player.id}
          player={player}
          state={state}
        />
      ))}
    </div>
  </article>
);

interface PubGolfOrganizerProperties {
  actions: PubGolfActions;
  state: PubState;
  teamActions: Pick<ScrambleActions, "setTeamName">;
  teamNames: TeamNames;
}

const TEAM_IDS = ["A", "B", "C"] as const;

export const PubGolfOrganizer = ({
  actions,
  state,
  teamActions,
  teamNames,
}: PubGolfOrganizerProperties) => (
  <Panel>
    <div>
      <SectionHeading icon={BeerSteinIcon} title="Pub Golf Organizer" />
      <p className="text-sm text-base-content/70">
        Correct scores and penalties, rename teams, and lock completed holes.
      </p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TEAM_IDS.map((teamId) => (
        <label key={teamId}>
          <span className="mb-1 block text-sm">Team {teamId} name</span>
          <input
            className="input w-full"
            defaultValue={teamNames[teamId]}
            onBlur={(event) => {
              void teamActions.setTeamName(teamId, event.target.value);
            }}
          />
        </label>
      ))}
    </div>
    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {PUB_EVENT.holes.map((hole) => (
        <button
          aria-pressed={state.locks[hole.id] === true}
          className={
            state.locks[hole.id] === true
              ? "btn btn-sm btn-warning"
              : "btn btn-ghost btn-sm"
          }
          key={hole.id}
          onClick={() => {
            void actions.toggleLock(hole.id);
          }}
          type="button"
        >
          {state.locks[hole.id] === true ? (
            <LockIcon aria-hidden="true" size={16} />
          ) : (
            <LockOpenIcon aria-hidden="true" size={16} />
          )}
          Hole {hole.id.slice(1)}:{" "}
          {state.locks[hole.id] === true ? "Locked" : "Unlocked"}
        </button>
      ))}
    </div>
    <div className="grid gap-4">
      {TEAM_IDS.map((teamId) => (
        <TeamEditor
          actions={actions}
          key={teamId}
          state={state}
          teamId={teamId}
          teamName={teamNames[teamId]}
        />
      ))}
    </div>
  </Panel>
);
