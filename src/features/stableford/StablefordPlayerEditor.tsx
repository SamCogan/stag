import { STABLEFORD_CONFIG, type StablefordPlayer } from "./config";
import { formatHoles, formatPoints } from "./formatting";
import { getStablefordHoleResult, getStablefordPlayerSummary } from "./scoring";
import { StablefordHoleEditor } from "./StablefordHoleEditor";
import { PlayerHeadshot } from "../../components/PlayerHeadshot";

import type { StablefordState } from "./state";
import type { OrganizerActions } from "./useStablefordStore";

interface StablefordPlayerEditorProperties {
  actions: OrganizerActions;
  onFeedback: (message: string) => void;
  player: StablefordPlayer;
  state: StablefordState;
}

export const StablefordPlayerEditor = ({
  actions,
  onFeedback,
  player,
  state,
}: StablefordPlayerEditorProperties) => {
  const handicap = state.handicaps[player.id] ?? player.handicap;
  const summary = getStablefordPlayerSummary(state, player);

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <PlayerHeadshot
          initials={player.initials}
          name={player.name}
          size="medium"
        />
        <div>
          <h3 className="text-lg font-bold">{player.name}</h3>
          <p className="text-sm text-base-content/70">
            Playing handicap {handicap}
          </p>
          <p className="text-sm font-semibold text-primary">
            {formatPoints(summary.totalPoints)} through{" "}
            {formatHoles(summary.holesCompleted)}
          </p>
          <p className="text-xs text-base-content/65">
            Front {summary.frontNinePoints} | Back {summary.backNinePoints}
          </p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {STABLEFORD_CONFIG.holes.map((hole) => (
          <StablefordHoleEditor
            disabled={false}
            hole={hole}
            key={hole.id}
            onClear={() => actions.clearHole(player.id, hole.id)}
            onFeedback={onFeedback}
            onPickup={() => actions.markPickup(player.id, hole.id)}
            onScore={(gross) => actions.setScore(player.id, hole.id, gross)}
            result={getStablefordHoleResult(state, player.id, handicap, hole)}
            shotsSubject={`${player.name} receives`}
          />
        ))}
      </div>
    </div>
  );
};
