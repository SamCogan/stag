import { GolfIcon } from "@phosphor-icons/react/Golf";
import { SignOutIcon } from "@phosphor-icons/react/SignOut";

import { STABLEFORD_EVENT_CODE } from "./config";
import { Panel } from "../../components/Panel";
import { PlayerHeadshot } from "../../components/PlayerHeadshot";
import { SectionHeading } from "../../components/SectionHeading";

import type { StablefordPlayer } from "./config";

interface StablefordSessionCardProperties {
  onLogout: () => void;
  player: StablefordPlayer;
}

export const StablefordSessionCard = ({
  onLogout,
  player,
}: StablefordSessionCardProperties) => (
  <Panel>
    <div className="flex items-center gap-3">
      <PlayerHeadshot
        initials={player.initials}
        name={player.name}
        size="medium"
      />
      <div>
        <SectionHeading icon={GolfIcon} title={`Continue as ${player.name}`} />
        <p className="text-sm text-base-content/70">
          Your Stableford login is saved on this device.
        </p>
      </div>
    </div>
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <a
        className="btn btn-primary"
        href={`?event=${STABLEFORD_EVENT_CODE}&mode=stableford`}
      >
        Open My Scorecard
      </a>
      <button
        aria-label="Log out of Stableford"
        className="btn btn-square btn-ghost"
        onClick={onLogout}
        type="button"
      >
        <SignOutIcon aria-hidden="true" size={18} weight="duotone" />
      </button>
    </div>
  </Panel>
);
