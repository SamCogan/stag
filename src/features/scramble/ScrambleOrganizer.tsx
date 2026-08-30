import { CrosshairIcon } from "@phosphor-icons/react/Crosshair";
import { EraserIcon } from "@phosphor-icons/react/Eraser";
import { FlagPennantIcon } from "@phosphor-icons/react/FlagPennant";
import { LockIcon } from "@phosphor-icons/react/Lock";
import { LockOpenIcon } from "@phosphor-icons/react/LockOpen";
import { MapTrifoldIcon } from "@phosphor-icons/react/MapTrifold";

import { scrambleScoreKey } from "./scoring";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Panel } from "../../components/Panel";
import { PlayerHeadshot } from "../../components/PlayerHeadshot";
import { ScoreStepper } from "../../components/ScoreStepper";
import { SectionHeading } from "../../components/SectionHeading";
import { PUB_EVENT } from "../../config/pubGolf";
import {
  getVilaSolHoles,
  VILA_SOL_LOOP_COMBINATIONS,
} from "../../config/vilaSol";

import type { ScrambleActions } from "./useScrambleStore";
import type { TeamId, VilaSolHole } from "../../config/eventSchemas";
import type { VilaSolLoopCombination } from "../../config/vilaSol";
import type { ScrambleState, TeamNames } from "../../state/golfState";

interface OrganizerTeamScoreProperties {
  actions: ScrambleActions;
  hole: VilaSolHole;
  state: ScrambleState;
  teamId: TeamId;
  teamName: string;
}

const OrganizerTeamScore = ({
  actions,
  hole,
  state,
  teamId,
  teamName,
}: OrganizerTeamScoreProperties) => {
  const key = scrambleScoreKey(teamId, hole.id);

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-3">
      <strong>{teamName}</strong>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <ScoreStepper
          ariaLabel={`${teamName}, hole ${String(hole.number)}`}
          onChange={(value) => {
            void actions.setScore(teamId, hole.id, value);
          }}
          value={state.scores[key] ?? hole.par}
        />
        <div className="flex flex-wrap gap-1">
          {PUB_EVENT.teams[teamId].players.map((player) => (
            <button
              aria-label={`Select ${player.name}'s drive for ${teamName}, hole ${String(hole.number)}`}
              aria-pressed={state.drives[key] === player.id}
              className={
                state.drives[key] === player.id
                  ? "btn relative btn-circle btn-primary"
                  : "btn relative btn-circle btn-ghost"
              }
              key={player.id}
              onClick={() => {
                void actions.setDrive(teamId, hole.id, player.id);
              }}
              type="button"
            >
              <PlayerHeadshot
                image={player.image}
                initials={player.name.slice(0, 2)}
                name={player.name}
                size="small"
              />
              {state.drives[key] === player.id && (
                <CrosshairIcon
                  aria-hidden="true"
                  className="absolute -right-1 -bottom-1 rounded-full bg-primary-content p-0.5 text-primary"
                  size={18}
                  weight="bold"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ScrambleOrganizerProperties {
  actions: ScrambleActions;
  loopCombination: VilaSolLoopCombination;
  state: ScrambleState;
  teamNames: TeamNames;
}

const TEAM_IDS = ["A", "B", "C"] as const;

interface OrganizerHoleProperties {
  actions: ScrambleActions;
  hole: VilaSolHole;
  state: ScrambleState;
  teamNames: TeamNames;
}

const OrganizerHole = ({
  actions,
  hole,
  state,
  teamNames,
}: OrganizerHoleProperties) => (
  <article className="card border border-base-300 bg-base-200">
    <div className="card-body gap-3 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="card-title">Hole {hole.number}</h3>
          <p className="text-xs">
            {hole.loop} | Par {hole.par} | SI {hole.si}
          </p>
        </div>
        <button
          aria-pressed={state.locks[hole.id] === true}
          className={
            state.locks[hole.id] === true
              ? "btn btn-sm btn-warning"
              : "btn btn-ghost btn-sm"
          }
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
          {state.locks[hole.id] === true ? "Unlock" : "Lock"}
        </button>
      </div>
      <div className="grid gap-2 lg:grid-cols-3">
        {TEAM_IDS.map((teamId) => (
          <OrganizerTeamScore
            actions={actions}
            hole={hole}
            key={teamId}
            state={state}
            teamId={teamId}
            teamName={teamNames[teamId]}
          />
        ))}
      </div>
    </div>
  </article>
);

export const ScrambleOrganizer = ({
  actions,
  loopCombination,
  state,
  teamNames,
}: ScrambleOrganizerProperties) => {
  const holes = getVilaSolHoles(loopCombination);

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionHeading
            icon={FlagPennantIcon}
            title="Vila Sol Scramble Organizer"
          />
          <p className="text-sm text-base-content/70">
            Manage loops, team names, scores, selected drives, and locks.
          </p>
        </div>
        <ConfirmDialog
          confirmLabel="Reset Scramble"
          description="This clears only Vila Sol Scramble scores, drives, and locks."
          onConfirm={() => {
            void actions.resetScores();
          }}
          title="Reset Vila Sol Scramble?"
        >
          <button className="btn btn-error btn-sm" type="button">
            <EraserIcon aria-hidden="true" size={16} />
            Reset Scramble
          </button>
        </ConfirmDialog>
      </div>
      <label>
        <span className="mb-1 flex items-center gap-1 text-sm font-semibold">
          <MapTrifoldIcon aria-hidden="true" size={16} />
          Course nines
        </span>
        <select
          className="select w-full max-w-xs"
          onChange={(event) => {
            void actions.setLoopCombination(
              event.target.value as VilaSolLoopCombination,
            );
          }}
          value={loopCombination}
        >
          {Object.keys(VILA_SOL_LOOP_COMBINATIONS).map((combination) => (
            <option key={combination} value={combination}>
              {combination}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        {TEAM_IDS.map((teamId) => (
          <label key={teamId}>
            <span className="mb-1 block text-sm">Team {teamId} name</span>
            <input
              className="input w-full"
              defaultValue={teamNames[teamId]}
              onBlur={(event) => {
                void actions.setTeamName(teamId, event.target.value);
              }}
            />
          </label>
        ))}
      </div>
      <div className="grid gap-4">
        {holes.map((hole) => (
          <OrganizerHole
            actions={actions}
            hole={hole}
            key={hole.id}
            state={state}
            teamNames={teamNames}
          />
        ))}
      </div>
    </Panel>
  );
};
