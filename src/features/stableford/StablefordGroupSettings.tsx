import { WarningIcon } from "@phosphor-icons/react/Warning";

import {
  STABLEFORD_CONFIG,
  type StablefordGroupId,
  type StablefordPlayer,
} from "./config";
import { validateStablefordGroups } from "./state";
import { PlayerHeadshot } from "../../components/PlayerHeadshot";

import type { StablefordState } from "./state";
import type { OrganizerActions } from "./useStablefordStore";

interface StablefordGroupSettingsProperties {
  actions: Pick<OrganizerActions, "setGroup" | "setGroupName" | "setHandicap">;
  onFeedback: (message: string) => void;
  state: StablefordState;
}

const GROUP_IDS = ["A", "B", "C"] as const;

const runAction = async (
  action: Promise<void>,
  message: string,
  onFeedback: (message: string) => void,
): Promise<void> => {
  try {
    await action;
    onFeedback(message);
  } catch (error: unknown) {
    onFeedback(
      error instanceof Error ? error.message : "Unable to update event setup",
    );
  }
};

const getGroupId = (value: string): StablefordGroupId | undefined =>
  GROUP_IDS.find((groupId) => groupId === value);

const PlayerSetupRow = ({
  actions,
  onFeedback,
  player,
  state,
}: StablefordGroupSettingsProperties & { player: StablefordPlayer }) => (
  <div className="grid items-center gap-3 rounded-box border border-base-300 bg-base-200 p-3 sm:grid-cols-[auto_1fr_8rem_8rem]">
    <PlayerHeadshot
      initials={player.initials}
      name={player.name}
      size="small"
    />
    <strong>{player.name}</strong>
    <label>
      <span className="sr-only">{player.name} group</span>
      <select
        aria-label={`${player.name} group`}
        className="select w-full select-sm"
        onChange={(event) => {
          const groupId = getGroupId(event.target.value);
          if (groupId !== undefined) {
            void runAction(
              actions.setGroup(player.id, groupId),
              `${player.name} moved to ${state.groupNames[groupId]}`,
              onFeedback,
            );
          }
        }}
        value={state.groups[player.id]}
      >
        {GROUP_IDS.map((groupId) => (
          <option key={groupId} value={groupId}>
            {state.groupNames[groupId]}
          </option>
        ))}
      </select>
    </label>
    <label>
      <span className="sr-only">{player.name} handicap</span>
      <input
        aria-label={`${player.name} handicap`}
        className="input w-full input-sm"
        defaultValue={state.handicaps[player.id] ?? player.handicap}
        inputMode="numeric"
        key={String(state.handicaps[player.id] ?? player.handicap)}
        max="54"
        min="0"
        onBlur={(event) => {
          const input = event.currentTarget;
          const handicap = Number(input.value);
          if (!Number.isInteger(handicap) || handicap < 0 || handicap > 54) {
            input.setCustomValidity("Enter a whole number from 0 through 54.");
            input.reportValidity();
            return;
          }
          input.setCustomValidity("");
          void runAction(
            actions.setHandicap(player.id, handicap),
            `${player.name} handicap updated`,
            onFeedback,
          );
        }}
        onChange={(event) => {
          event.currentTarget.setCustomValidity("");
        }}
        type="number"
      />
    </label>
  </div>
);

export const StablefordGroupSettings = ({
  actions,
  onFeedback,
  state,
}: StablefordGroupSettingsProperties) => {
  const validation = validateStablefordGroups(state.groups);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {GROUP_IDS.map((groupId) => (
          <label key={groupId}>
            <span className="mb-1 block text-sm font-semibold">
              Group {groupId} name
            </span>
            <input
              className="input w-full"
              defaultValue={state.groupNames[groupId]}
              key={state.groupNames[groupId]}
              onBlur={(event) => {
                const input = event.currentTarget;
                const name = input.value.trim();
                if (name.length === 0) {
                  input.setCustomValidity("Group name cannot be blank.");
                  input.reportValidity();
                  return;
                }
                input.setCustomValidity("");
                void runAction(
                  actions.setGroupName(groupId, name),
                  `Group ${groupId} renamed`,
                  onFeedback,
                );
              }}
              onChange={(event) => {
                event.currentTarget.setCustomValidity("");
              }}
            />
          </label>
        ))}
      </div>
      {!validation.isValid && (
        <div className="alert alert-warning" role="alert">
          <WarningIcon aria-hidden="true" size={20} weight="duotone" />
          <span>
            Groups must contain four players each. Current counts: A{" "}
            {validation.counts.A}, B {validation.counts.B}, C{" "}
            {validation.counts.C}.
          </span>
        </div>
      )}
      <div className="grid gap-2">
        {STABLEFORD_CONFIG.players.map((player) => (
          <PlayerSetupRow
            actions={actions}
            key={player.id}
            onFeedback={onFeedback}
            player={player}
            state={state}
          />
        ))}
      </div>
    </div>
  );
};
