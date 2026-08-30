import { GolfIcon } from "@phosphor-icons/react/Golf";
import { SignOutIcon } from "@phosphor-icons/react/SignOut";
import { useState } from "react";

import { STABLEFORD_CONFIG } from "./config";
import { getStablefordHoleResult, getStablefordPlayerSummary } from "./scoring";
import { StablefordHoleEditor } from "./StablefordHoleEditor";
import { Panel } from "../../components/Panel";
import { PlayerHeadshot } from "../../components/PlayerHeadshot";
import { SectionHeading } from "../../components/SectionHeading";

import type { StablefordPlayer } from "./config";
import type { StablefordState } from "./state";
import type { PlayerScoreActions } from "./useStablefordStore";

interface StablefordScorecardProperties {
  actions: PlayerScoreActions;
  onLogout: () => void;
  player: StablefordPlayer;
  state: StablefordState;
}

export const StablefordScorecard = ({
  actions,
  onLogout,
  player,
  state,
}: StablefordScorecardProperties) => {
  const [feedback, setFeedback] = useState("");
  const handicap = state.handicaps[player.id] ?? player.handicap;
  const summary = getStablefordPlayerSummary(state, player);

  return (
    <div className="grid gap-4">
      <Panel>
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
          <PlayerHeadshot
            className="size-12 text-sm sm:size-20 sm:text-xl"
            initials={player.initials}
            name={player.name}
            size="large"
          />
          <div className="min-w-0">
            <SectionHeading icon={GolfIcon} title="My Stableford Scorecard" />
            <p className="text-sm text-base-content/70">
              {player.name} | Playing handicap {handicap}
            </p>
            <p className="text-xs text-base-content/65">
              {STABLEFORD_CONFIG.courseName} | {STABLEFORD_CONFIG.teeName}
            </p>
          </div>
          <button
            aria-label="Log out"
            className="btn min-h-11 min-w-11 btn-ghost btn-sm sm:w-auto sm:px-3"
            onClick={onLogout}
            title="Log out"
            type="button"
          >
            <SignOutIcon aria-hidden="true" size={16} weight="duotone" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-box border border-base-300 bg-base-300 sm:grid-cols-4">
          <div className="bg-base-200 p-3 text-center sm:text-left">
            <div className="text-xs text-base-content/65">Front nine</div>
            <div aria-label="Front nine points" className="text-2xl font-bold">
              {summary.frontNinePoints}
            </div>
          </div>
          <div className="bg-base-200 p-3 text-center sm:text-left">
            <div className="text-xs text-base-content/65">Back nine</div>
            <div aria-label="Back nine points" className="text-2xl font-bold">
              {summary.backNinePoints}
            </div>
          </div>
          <div className="bg-base-200 p-3 text-center sm:text-left">
            <div className="text-xs text-base-content/65">Total</div>
            <div aria-label="Total points" className="text-2xl font-bold">
              {summary.totalPoints}
            </div>
          </div>
          <div className="bg-base-200 p-3 text-center sm:text-left">
            <div className="text-xs text-base-content/65">Completed</div>
            <div aria-label="Holes completed" className="text-2xl font-bold">
              {summary.holesCompleted}/18
            </div>
          </div>
        </div>
        {feedback.length > 0 && (
          <p aria-live="polite" className="text-sm text-base-content/70">
            {feedback}
          </p>
        )}
      </Panel>
      <div className="grid gap-3 md:grid-cols-2">
        {STABLEFORD_CONFIG.holes.map((hole) => (
          <StablefordHoleEditor
            disabled={state.locks[hole.id] === true}
            hole={hole}
            key={hole.id}
            onClear={() => actions.clearHole(hole.id)}
            onFeedback={setFeedback}
            onPickup={() => actions.markPickup(hole.id)}
            onScore={(gross) => actions.setScore(hole.id, gross)}
            result={getStablefordHoleResult(state, player.id, handicap, hole)}
          />
        ))}
      </div>
    </div>
  );
};
