import { EraserIcon } from "@phosphor-icons/react/Eraser";
import { FlagPennantIcon } from "@phosphor-icons/react/FlagPennant";
import { LockIcon } from "@phosphor-icons/react/Lock";
import { LockOpenIcon } from "@phosphor-icons/react/LockOpen";
import { UsersThreeIcon } from "@phosphor-icons/react/UsersThree";
import { useState } from "react";

import { STABLEFORD_CONFIG } from "./config";
import { StablefordGroupSettings } from "./StablefordGroupSettings";
import { StablefordPlayerEditor } from "./StablefordPlayerEditor";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Panel } from "../../components/Panel";
import { SectionHeading } from "../../components/SectionHeading";

import type { StablefordState } from "./state";
import type { OrganizerActions } from "./useStablefordStore";

interface StablefordOrganizerProperties {
  actions: OrganizerActions;
  state: StablefordState;
}

const getActionError = (error: unknown): string =>
  error instanceof Error ? error.message : "Unable to update the event";

const runAction = async (
  action: Promise<void>,
  message: string,
  onFeedback: (message: string) => void,
): Promise<void> => {
  try {
    await action;
    onFeedback(message);
  } catch (error: unknown) {
    onFeedback(getActionError(error));
  }
};

const OrganizerHeader = ({
  actions,
  feedback,
  onFeedback,
}: {
  actions: Pick<OrganizerActions, "resetEvent">;
  feedback: string;
  onFeedback: (message: string) => void;
}) => (
  <Panel>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <SectionHeading
          icon={FlagPennantIcon}
          title="Coollattin Stableford Organizer"
        />
        <p className="text-sm text-base-content/70">
          Manage groups, handicaps, scores, pickups, and hole locks.
        </p>
      </div>
      <ConfirmDialog
        confirmLabel="Reset Stableford"
        description="This resets Stableford scores, pickups, locks, handicaps, groups, and group names without affecting Pub Golf or Scramble."
        onConfirm={() => {
          void runAction(
            actions.resetEvent(),
            "Stableford event reset",
            onFeedback,
          );
        }}
        title="Reset Stableford?"
      >
        <button className="btn btn-error btn-sm" type="button">
          <EraserIcon aria-hidden="true" size={16} weight="duotone" />
          Reset Stableford
        </button>
      </ConfirmDialog>
    </div>
    <p aria-live="polite" className="text-sm text-base-content/70">
      {feedback}
    </p>
  </Panel>
);

const HoleLocks = ({
  actions,
  onFeedback,
  state,
}: StablefordOrganizerProperties & {
  onFeedback: (message: string) => void;
}) => (
  <Panel>
    <SectionHeading icon={LockIcon} title="Hole Locks" />
    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {STABLEFORD_CONFIG.holes.map((hole) => {
        const isLocked = state.locks[hole.id] === true;
        return (
          <button
            aria-pressed={isLocked}
            className={
              isLocked ? "btn btn-sm btn-warning" : "btn btn-ghost btn-sm"
            }
            key={hole.id}
            onClick={() => {
              void runAction(
                actions.toggleLock(hole.id),
                `Hole ${hole.id} lock updated`,
                onFeedback,
              );
            }}
            type="button"
          >
            {isLocked ? (
              <LockIcon aria-hidden="true" size={16} />
            ) : (
              <LockOpenIcon aria-hidden="true" size={16} />
            )}
            Hole {hole.number}: {isLocked ? "Locked" : "Unlocked"}
          </button>
        );
      })}
    </div>
  </Panel>
);

const PlayerScoreEditor = ({
  actions,
  onFeedback,
  selectedPlayerId,
  setSelectedPlayerId,
  state,
}: StablefordOrganizerProperties & {
  onFeedback: (message: string) => void;
  selectedPlayerId: string;
  setSelectedPlayerId: (playerId: string) => void;
}) => {
  const selectedPlayer = STABLEFORD_CONFIG.players.find(
    (player) => player.id === selectedPlayerId,
  );
  if (selectedPlayer === undefined) {
    throw new Error("Stableford configuration has no players");
  }

  return (
    <Panel>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label>
          <span className="mb-1 block text-sm font-semibold">
            Player to edit
          </span>
          <select
            className="select w-full"
            onChange={(event) => {
              setSelectedPlayerId(event.target.value);
            }}
            value={selectedPlayer.id}
          >
            {STABLEFORD_CONFIG.players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </label>
        <span className="mb-2 badge badge-outline">
          {state.groupNames[state.groups[selectedPlayer.id] ?? "A"]}
        </span>
      </div>
      <StablefordPlayerEditor
        actions={actions}
        onFeedback={onFeedback}
        player={selectedPlayer}
        state={state}
      />
    </Panel>
  );
};

export const StablefordOrganizer = ({
  actions,
  state,
}: StablefordOrganizerProperties) => {
  const [feedback, setFeedback] = useState(
    "Organizer changes save automatically.",
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState(
    STABLEFORD_CONFIG.players[0]?.id ?? "",
  );

  return (
    <div className="grid gap-4">
      <OrganizerHeader
        actions={actions}
        feedback={feedback}
        onFeedback={setFeedback}
      />
      <Panel>
        <SectionHeading icon={UsersThreeIcon} title="Groups and Handicaps" />
        <StablefordGroupSettings
          actions={actions}
          onFeedback={setFeedback}
          state={state}
        />
      </Panel>
      <HoleLocks actions={actions} onFeedback={setFeedback} state={state} />
      <PlayerScoreEditor
        actions={actions}
        onFeedback={setFeedback}
        selectedPlayerId={selectedPlayerId}
        setSelectedPlayerId={setSelectedPlayerId}
        state={state}
      />
    </div>
  );
};
