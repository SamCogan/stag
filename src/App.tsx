import { GolfIcon } from "@phosphor-icons/react/Golf";
import { ListNumbersIcon } from "@phosphor-icons/react/ListNumbers";
import { UsersThreeIcon } from "@phosphor-icons/react/UsersThree";
import useLocalStorageState from "use-local-storage-state";

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
import { findStablefordPlayer } from "./features/stableford/auth";
import {
  STABLEFORD_EVENT_CODE,
  STABLEFORD_IDENTITY_STORAGE_KEY,
} from "./features/stableford/config";
import { StablefordLeaderboard } from "./features/stableford/StablefordLeaderboard";
import { StablefordLogin } from "./features/stableford/StablefordLogin";
import { StablefordOrganizer } from "./features/stableford/StablefordOrganizer";
import { StablefordScorecard } from "./features/stableford/StablefordScorecard";
import { StablefordSessionCard } from "./features/stableford/StablefordSessionCard";
import { useStablefordStore } from "./features/stableford/useStablefordStore";
import { useAppRoute } from "./routes";

import type { NetworkState } from "./hooks/useEventState";

const getNetworkState = (
  mode: string,
  pub: NetworkState,
  scramble: NetworkState,
  stableford: NetworkState,
): NetworkState => {
  if (mode.startsWith("scramble")) {
    return scramble;
  }
  if (mode.startsWith("stableford")) {
    return stableford;
  }
  return pub;
};

const hasEntries = (record: Readonly<Record<string, unknown>>): boolean =>
  Object.keys(record).length > 0;

function App() {
  const [route] = useAppRoute();
  const pub = usePubGolfStore("stag2026");
  const scramble = useScrambleStore();
  const [stablefordPlayerId, setStablefordPlayerId, { removeItem }] =
    useLocalStorageState<string>(STABLEFORD_IDENTITY_STORAGE_KEY);
  const stablefordPlayer = findStablefordPlayer(stablefordPlayerId);
  const stableford = useStablefordStore(stablefordPlayer?.id);
  const handleStablefordAuthentication = (
    player: NonNullable<typeof stablefordPlayer>,
  ): void => {
    setStablefordPlayerId(player.id);
  };
  const teamId = route.teamId;
  const canEditTeam =
    teamId !== undefined && PUB_EVENT.teams[teamId].key === route.key;
  const hasLiveScoringActivity = [
    pub.state.penalties,
    pub.state.scores,
    scramble.state.drives,
    scramble.state.scores,
    stableford.state.pickups,
    stableford.state.scores,
  ].some((record) => hasEntries(record));
  const isStablefordEvent = route.eventCode === STABLEFORD_EVENT_CODE;
  const networkState = isStablefordEvent
    ? stableford.networkState
    : getNetworkState(
        route.mode,
        pub.networkState,
        scramble.networkState,
        stableford.networkState,
      );
  const stablefordAccess =
    stablefordPlayer === undefined ? (
      <StablefordLogin onAuthenticated={handleStablefordAuthentication} />
    ) : (
      <StablefordSessionCard onLogout={removeItem} player={stablefordPlayer} />
    );
  return (
    <AppShell
      eventCode={route.eventCode}
      mode={route.mode}
      networkState={networkState}
    >
      {route.mode === "home" && isStablefordEvent && (
        <>
          <Panel>
            <SectionHeading
              icon={GolfIcon}
              title="Coollattin Individual Stableford"
            />
            <p className="text-sm text-base-content/70">
              Live individual scoring, standings, and hole-by-hole results.
            </p>
          </Panel>
          {stablefordAccess}
        </>
      )}
      {route.mode === "home" && !isStablefordEvent && (
        <>
          <Panel>
            <SectionHeading icon={UsersThreeIcon} title="Live Visitor Board" />
            <p className="text-sm text-base-content/70">
              {hasLiveScoringActivity
                ? "Public live scores across all active game types."
                : "No live scores yet. This board will update when players begin scoring."}
            </p>
          </Panel>
          <div className="grid gap-4 lg:grid-cols-2">
            <TeamLogin />
            {stablefordAccess}
          </div>
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
          <StablefordLeaderboard state={stableford.state} />
          <OverallStandings
            loopCombination={scramble.loopCombination}
            pubState={pub.state}
            scrambleState={scramble.state}
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
      {route.mode === "stableford" &&
        (stablefordPlayer === undefined ||
        stableford.playerActions === undefined ? (
          <>
            <StablefordLogin onAuthenticated={handleStablefordAuthentication} />
            <StablefordLeaderboard state={stableford.state} />
          </>
        ) : (
          <StablefordScorecard
            actions={stableford.playerActions}
            onLogout={removeItem}
            player={stablefordPlayer}
            state={stableford.state}
          />
        ))}
      {route.mode === "stableford-org" && (
        <OrganizerGate>
          <StablefordOrganizer
            actions={stableford.organizerActions}
            state={stableford.state}
          />
        </OrganizerGate>
      )}
      {route.mode === "stableford-stats" && (
        <StablefordLeaderboard state={stableford.state} />
      )}
      {teamId === undefined && ["captain", "scramble"].includes(route.mode) && (
        <Panel>
          <h2 className="card-title">Choose a valid team</h2>
          <p>Return home and sign in as Team 1, Team 2, or Team 3.</p>
        </Panel>
      )}
    </AppShell>
  );
}

export default App;
