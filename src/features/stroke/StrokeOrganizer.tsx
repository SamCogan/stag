import { EraserIcon } from "@phosphor-icons/react/Eraser";
import { FlagCheckeredIcon } from "@phosphor-icons/react/FlagCheckered";
import { LockIcon } from "@phosphor-icons/react/Lock";
import { LockOpenIcon } from "@phosphor-icons/react/LockOpen";
import { MapTrifoldIcon } from "@phosphor-icons/react/MapTrifold";

import { strokeScoreKey } from "./scoring";
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

import type { StrokeActions } from "./useStrokeStore";
import type { Player, VilaSolHole } from "../../config/eventSchemas";
import type { VilaSolLoopCombination } from "../../config/vilaSol";
import type { StrokeState } from "../../state/golfState";
import type { ScrambleActions } from "../scramble/useScrambleStore";

interface StrokePlayerEditorProperties {
  actions: StrokeActions;
  holes: readonly VilaSolHole[];
  player: Player;
  state: StrokeState;
}

const StrokePlayerEditor = ({
  actions,
  holes,
  player,
  state,
}: StrokePlayerEditorProperties) => (
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
      <label>
        <span className="mb-1 block text-sm">Playing handicap</span>
        <input
          className="input w-28"
          defaultValue={state.handicaps[player.id] ?? 0}
          inputMode="numeric"
          min="0"
          onBlur={(event) => {
            void actions.setHandicap(player.id, Number(event.target.value));
          }}
          type="number"
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {holes.map((hole) => (
          <div className="rounded-box border border-base-300 p-3" key={hole.id}>
            <strong>Hole {hole.number}</strong>
            <p className="mb-2 text-xs">
              Par {hole.par} | SI {hole.si}
            </p>
            <ScoreStepper
              ariaLabel={`${player.name}, hole ${String(hole.number)}`}
              onChange={(value) => {
                void actions.setScore(player.id, hole.id, value);
              }}
              value={
                state.scores[strokeScoreKey(player.id, hole.id)] ?? hole.par
              }
            />
          </div>
        ))}
      </div>
    </div>
  </details>
);

interface StrokeOrganizerProperties {
  actions: StrokeActions;
  loopActions: Pick<ScrambleActions, "setLoopCombination">;
  loopCombination: VilaSolLoopCombination;
  state: StrokeState;
}

export const StrokeOrganizer = ({
  actions,
  loopActions,
  loopCombination,
  state,
}: StrokeOrganizerProperties) => {
  const holes = getVilaSolHoles(loopCombination);
  const players = Object.values(PUB_EVENT.teams).flatMap(
    (team) => team.players,
  );

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionHeading
            icon={FlagCheckeredIcon}
            title="Stroke Play Organizer - Vila Sol"
          />
          <p className="text-sm text-base-content/70">
            Recovery baseline for handicaps, scores, loops, and hole locks.
          </p>
        </div>
        <ConfirmDialog
          confirmLabel="Reset Stroke Scores"
          description="This clears historical Stroke Play scores and locks while keeping handicaps."
          onConfirm={() => {
            void actions.resetScores();
          }}
          title="Reset Stroke Play?"
        >
          <button className="btn btn-error btn-sm" type="button">
            <EraserIcon aria-hidden="true" size={16} />
            Reset Scores
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
            void loopActions.setLoopCombination(
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
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {holes.map((hole) => (
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
            Hole {hole.number}:{" "}
            {state.locks[hole.id] === true ? "Locked" : "Unlocked"}
          </button>
        ))}
      </div>
      <div className="grid gap-3">
        {players.map((player) => (
          <StrokePlayerEditor
            actions={actions}
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
