import { STABLEFORD_CONFIG } from "./config";
import { formatPoints } from "./formatting";
import { getStablefordHoleResult } from "./scoring";

import type { StablefordHole } from "./config";
import type { StablefordHoleResult, StablefordPlayerSummary } from "./scoring";
import type { StablefordState } from "./state";

interface HoleCellProperties {
  hole: StablefordHole;
  playerName: string;
  result: StablefordHoleResult;
}

const getPointsLabel = (points: number): string =>
  points === 1 ? "1 point" : `${String(points)} points`;

const getGrossDisplay = (result: StablefordHoleResult): string => {
  if (result.status === "scored") {
    return String(result.gross);
  }
  return result.status === "picked-up" ? "P" : "—";
};

const getHoleLabel = (
  playerName: string,
  hole: StablefordHole,
  result: StablefordHoleResult,
): string => {
  if (result.status === "scored") {
    return `${playerName}, hole ${String(hole.number)}: gross ${String(result.gross)}, net ${String(result.net)}, ${getPointsLabel(result.points)}`;
  }
  if (result.status === "picked-up") {
    return `${playerName}, hole ${String(hole.number)}: picked up, 0 points`;
  }
  return `${playerName}, hole ${String(hole.number)}: unplayed`;
};

const HoleCell = ({ hole, playerName, result }: HoleCellProperties) => (
  <td
    aria-label={getHoleLabel(playerName, hole, result)}
    className="min-w-14 border-l border-base-300 text-center"
  >
    <strong className="block text-sm tabular-nums">
      {getGrossDisplay(result)}
    </strong>
    <span className="block text-[0.65rem] text-base-content/65">
      {result.completed ? formatPoints(result.points) : "\u00A0"}
    </span>
  </td>
);

interface PlayerRowProperties {
  standing: StablefordPlayerSummary;
  state: StablefordState;
}

const PlayerRow = ({ standing, state }: PlayerRowProperties) => (
  <tr>
    <th
      className="sticky left-0 z-10 min-w-32 border-r border-base-300 bg-base-100"
      scope="row"
    >
      <strong className="block max-w-28 truncate">
        {standing.position}. {standing.player.name}
      </strong>
      <span className="text-[0.65rem] font-normal text-base-content/65">
        Playing HC {standing.handicap}
      </span>
    </th>
    {STABLEFORD_CONFIG.holes.map((hole) => (
      <HoleCell
        hole={hole}
        key={hole.id}
        playerName={standing.player.name}
        result={getStablefordHoleResult(
          state,
          standing.player.id,
          standing.handicap,
          hole,
        )}
      />
    ))}
    <td className="min-w-16 border-l border-base-300 text-center font-bold tabular-nums">
      {standing.frontNinePoints}
    </td>
    <td className="min-w-16 border-l border-base-300 text-center font-bold tabular-nums">
      {standing.backNinePoints}
    </td>
    <td className="min-w-16 border-l border-base-300 bg-primary/15 text-center text-base font-bold text-primary tabular-nums">
      {standing.totalPoints}
    </td>
  </tr>
);

interface StablefordLiveScorecardProperties {
  standings: readonly StablefordPlayerSummary[];
  state: StablefordState;
}

export const StablefordLiveScorecard = ({
  standings,
  state,
}: StablefordLiveScorecardProperties) => (
  <section className="grid gap-3 border-t border-base-300 pt-4">
    <div>
      <h3 className="text-lg font-bold">Live scorecard</h3>
      <p className="text-xs text-base-content/65">
        Gross scores appear above Stableford points. Swipe horizontally to view
        all 18 holes.
      </p>
    </div>
    <div
      aria-label="Scrollable Stableford scorecard"
      className="overflow-x-auto overscroll-x-contain rounded-box border border-base-300"
      role="region"
    >
      <table
        aria-label="Coollattin Stableford live scorecard"
        className="table w-max min-w-full table-xs"
      >
        <thead>
          <tr>
            <th className="sticky left-0 z-20 min-w-32 border-r border-base-300 bg-base-200">
              Player
            </th>
            {STABLEFORD_CONFIG.holes.map((hole) => (
              <th
                aria-label={`Hole ${String(hole.number)}, par ${String(hole.par)}`}
                className="min-w-14 border-l border-base-300 text-center"
                key={hole.id}
                scope="col"
              >
                <strong className="block">{hole.number}</strong>
                <span className="text-[0.65rem] font-normal">
                  Par {hole.par}
                </span>
              </th>
            ))}
            <th className="min-w-16 border-l border-base-300 text-center">
              Out
            </th>
            <th className="min-w-16 border-l border-base-300 text-center">
              In
            </th>
            <th className="min-w-16 border-l border-base-300 text-center">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing) => (
            <PlayerRow
              key={standing.player.id}
              standing={standing}
              state={state}
            />
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
