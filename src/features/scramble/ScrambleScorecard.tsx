import { CrosshairIcon } from "@phosphor-icons/react/Crosshair";
import { GolfIcon } from "@phosphor-icons/react/Golf";

import { scrambleScoreKey } from "./scoring";
import { Panel } from "../../components/Panel";
import { PlayerHeadshot } from "../../components/PlayerHeadshot";
import { ScoreStepper } from "../../components/ScoreStepper";
import { SectionHeading } from "../../components/SectionHeading";
import { PUB_EVENT } from "../../config/pubGolf";
import { getVilaSolHoles } from "../../config/vilaSol";

import type { ScrambleActions } from "./useScrambleStore";
import type { TeamId } from "../../config/eventSchemas";
import type { VilaSolLoopCombination } from "../../config/vilaSol";
import type { ScrambleState } from "../../state/golfState";

interface ScrambleScorecardProperties {
  actions: ScrambleActions;
  canEdit: boolean;
  loopCombination: VilaSolLoopCombination;
  state: ScrambleState;
  teamId: TeamId;
  teamName: string;
}

const SelectedDriveMarker = () => (
  <CrosshairIcon aria-hidden="true" size={16} weight="bold" />
);

export const ScrambleScorecard = ({
  actions,
  canEdit,
  loopCombination,
  state,
  teamId,
  teamName,
}: ScrambleScorecardProperties) => {
  const holes = getVilaSolHoles(loopCombination);
  const team = PUB_EVENT.teams[teamId];

  return (
    <Panel>
      <div>
        <SectionHeading icon={GolfIcon} title="Texas Scramble - Vila Sol" />
        <p className="text-sm text-base-content/70">
          Par {holes.reduce((total, hole) => total + hole.par, 0)} [
          {loopCombination} nines]
        </p>
        <p className="text-sm">
          Team: {teamName} |{" "}
          {canEdit ? "Edit enabled" : "Read only (wrong password)"}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {holes.map((hole) => {
          const key = scrambleScoreKey(teamId, hole.id);
          const disabled = !canEdit || state.locks[hole.id] === true;
          return (
            <article
              className="card border border-base-300 bg-base-200"
              key={hole.id}
            >
              <div className="card-body gap-3 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="card-title">Hole {hole.number}</h3>
                    <p className="text-xs text-base-content/65">
                      {hole.loop} | Par {hole.par} | SI {hole.si}
                    </p>
                  </div>
                  {state.locks[hole.id] === true && (
                    <span className="badge badge-sm badge-warning">Locked</span>
                  )}
                </div>
                <ScoreStepper
                  ariaLabel={`${teamName}, hole ${String(hole.number)}`}
                  disabled={disabled}
                  onChange={(value) => {
                    void actions.setScore(teamId, hole.id, value);
                  }}
                  value={state.scores[key] ?? hole.par}
                />
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold">
                    Whose drive was taken?
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {team.players.map((player) => {
                      const selected = state.drives[key] === player.id;
                      return (
                        <button
                          aria-pressed={selected}
                          className={
                            selected
                              ? "btn h-auto py-2 btn-primary"
                              : "btn h-auto btn-ghost py-2"
                          }
                          disabled={disabled}
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
                          {player.name}
                          {selected && <SelectedDriveMarker />}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
};
