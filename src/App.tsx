import { ListNumbersIcon } from "@phosphor-icons/react/ListNumbers";
import { UsersThreeIcon } from "@phosphor-icons/react/UsersThree";

import { AppShell } from "./components/AppShell";
import { OrganizerGate } from "./components/OrganizerGate";
import { OverallStandings } from "./components/OverallStandings";
import { Panel } from "./components/Panel";
import { SectionHeading } from "./components/SectionHeading";
import { TeamLogin } from "./components/TeamLogin";
import { PUB_EVENT } from "./config/pubGolf";
import { PubGolfLeaderboard } from "./features/pubGolf/PubGolfLeaderboard";
import { PubGolfOrganizer } from "./features/pubGolf/PubGolfOrganizer";
import { PubGolfScorecard } from "./features/pubGolf/PubGolfScorecard";
import { PubGolfStats } from "./features/pubGolf/PubGolfStats";
import { usePubGolfStore } from "./features/pubGolf/usePubGolfStore";
import { ScrambleLeaderboard } from "./features/scramble/ScrambleLeaderboard";
import { ScrambleOrganizer } from "./features/scramble/ScrambleOrganizer";
import { ScrambleScorecard } from "./features/scramble/ScrambleScorecard";
import { useScrambleStore } from "./features/scramble/useScrambleStore";
import { StrokeLeaderboard } from "./features/stroke/StrokeLeaderboard";
import { StrokeOrganizer } from "./features/stroke/StrokeOrganizer";
import { StrokeScorecard } from "./features/stroke/StrokeScorecard";
import { useStrokeStore } from "./features/stroke/useStrokeStore";
import { useAppRoute } from "./routes";

import type { NetworkState } from "./hooks/useEventState";

const getNetworkState = (
  mode: string,
  pub: NetworkState,
  scramble: NetworkState,
  stroke: NetworkState,
): NetworkState => {
  if (mode.startsWith("scramble")) {
    return scramble;
  }
  if (mode.startsWith("stroke")) {
    return stroke;
  }
  return pub;
};

function App() {
  const [route] = useAppRoute();
  const pub = usePubGolfStore("stag2026");
  const scramble = useScrambleStore();
  const stroke = useStrokeStore();
  const teamId = route.teamId;
  const canEditTeam =
    teamId !== undefined && PUB_EVENT.teams[teamId].key === route.key;
  const networkState = getNetworkState(
    route.mode,
    pub.networkState,
    scramble.networkState,
    stroke.networkState,
  );

  return (
    <AppShell
      eventCode={route.eventCode}
      mode={route.mode}
      networkState={networkState}
    >
      {route.mode === "home" && (
        <>
          <Panel>
            <SectionHeading icon={UsersThreeIcon} title="Live Visitor Board" />
            <p className="text-sm text-base-content/70">
              Public live scores across all active game types.
            </p>
          </Panel>
          <TeamLogin />
          <div className="grid gap-4 lg:grid-cols-2">
            <PubGolfLeaderboard
              state={pub.state}
              teamNames={scramble.teamNames}
            />
            <ScrambleLeaderboard
              loopCombination={scramble.loopCombination}
              state={scramble.state}
              teamNames={scramble.teamNames}
            />
          </div>
          <StrokeLeaderboard
            loopCombination={scramble.loopCombination}
            state={stroke.state}
            teamNames={scramble.teamNames}
          />
          <OverallStandings
            loopCombination={scramble.loopCombination}
            pubState={pub.state}
            scrambleState={scramble.state}
            strokeState={stroke.state}
            teamNames={scramble.teamNames}
          />
          <PubGolfLeaderboard
            icon={ListNumbersIcon}
            state={pub.state}
            teamNames={scramble.teamNames}
            title="Team Leaderboard"
          />
        </>
      )}
      {route.mode === "captain" && teamId !== undefined && (
        <PubGolfScorecard
          actions={pub.actions}
          canEdit={canEditTeam}
          state={pub.state}
          teamId={teamId}
          teamName={scramble.teamNames[teamId]}
        />
      )}
      {route.mode === "stats" && (
        <PubGolfStats state={pub.state} teamNames={scramble.teamNames} />
      )}
      {route.mode === "organizer" && (
        <OrganizerGate>
          <PubGolfOrganizer
            actions={pub.actions}
            state={pub.state}
            teamActions={scramble.actions}
            teamNames={scramble.teamNames}
          />
        </OrganizerGate>
      )}
      {route.mode === "scramble" && teamId !== undefined && (
        <ScrambleScorecard
          actions={scramble.actions}
          canEdit={canEditTeam}
          loopCombination={scramble.loopCombination}
          state={scramble.state}
          teamId={teamId}
          teamName={scramble.teamNames[teamId]}
        />
      )}
      {route.mode === "scramble-org" && (
        <OrganizerGate>
          <ScrambleOrganizer
            actions={scramble.actions}
            loopCombination={scramble.loopCombination}
            state={scramble.state}
            teamNames={scramble.teamNames}
          />
        </OrganizerGate>
      )}
      {route.mode === "stroke" && teamId !== undefined && (
        <StrokeScorecard
          actions={stroke.actions}
          canEdit={canEditTeam}
          loopCombination={scramble.loopCombination}
          state={stroke.state}
          teamId={teamId}
          teamName={scramble.teamNames[teamId]}
        />
      )}
      {route.mode === "stroke-org" && (
        <OrganizerGate>
          <StrokeOrganizer
            actions={stroke.actions}
            loopActions={scramble.actions}
            loopCombination={scramble.loopCombination}
            state={stroke.state}
          />
        </OrganizerGate>
      )}
      {route.mode === "stroke-stats" && (
        <StrokeLeaderboard
          loopCombination={scramble.loopCombination}
          state={stroke.state}
          teamNames={scramble.teamNames}
        />
      )}
      {teamId === undefined &&
        ["captain", "scramble", "stroke"].includes(route.mode) && (
          <Panel>
            <h2 className="card-title">Choose a valid team</h2>
            <p>Return home and sign in as Team 1, Team 2, or Team 3.</p>
          </Panel>
        )}
    </AppShell>
  );
}

export default App;
