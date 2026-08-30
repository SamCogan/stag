import { ChartBarIcon } from "@phosphor-icons/react/ChartBar";
import { CloudCheckIcon } from "@phosphor-icons/react/CloudCheck";
import { CloudSlashIcon } from "@phosphor-icons/react/CloudSlash";
import { FlagCheckeredIcon } from "@phosphor-icons/react/FlagCheckered";
import { HouseIcon } from "@phosphor-icons/react/House";
import { WrenchIcon } from "@phosphor-icons/react/Wrench";

import { stagLogo } from "../config/assets";

import type { NetworkState } from "../hooks/useEventState";
import type { ReactNode } from "react";

interface AppShellProperties {
  children: ReactNode;
  eventCode: string;
  mode: string;
  networkState: NetworkState;
}

const navigation = [
  { href: "?mode=home", icon: HouseIcon, label: "Home" },
  {
    href: "?mode=stats&event=stag2026",
    icon: ChartBarIcon,
    label: "Pub Stats",
  },
  {
    href: "?mode=stroke-stats&event=coollattin-stableford",
    icon: FlagCheckeredIcon,
    label: "Stableford Live",
  },
  {
    href: "?mode=organizer&event=stag2026",
    icon: WrenchIcon,
    label: "Pub Organizer",
  },
  {
    href: "?mode=scramble-org&event=vilasol",
    icon: WrenchIcon,
    label: "Scramble Organizer",
  },
  {
    href: "?mode=stroke-org&event=coollattin-stableford",
    icon: WrenchIcon,
    label: "Stableford Organizer",
  },
] as const;

export const AppShell = ({
  children,
  networkState,
}: AppShellProperties) => (
  <div
    className="
    mx-auto grid min-h-screen w-full max-w-6xl gap-4 p-2
    sm:p-4
  "
  >
    <header
      className="
      card border border-base-300 bg-linear-to-br from-base-200 to-secondary
      shadow-sm
    "
    >
      <div
        className="
        card-body gap-4 p-4
        sm:p-6
      "
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p
              className="
              text-xs font-bold tracking-widest text-accent uppercase
            "
            >
              Live Scoring
            </p>
            <h1
              className="
              text-2xl font-bold text-balance
              sm:text-3xl
            "
            >
              Ste&apos;s Stag 2026
            </h1>
            <span
              className="mt-3 badge font-semibold badge-primary"
              aria-live="polite"
            >
              {networkState === "connected" ? (
                <CloudCheckIcon
                  aria-hidden="true"
                  size={16}
                  weight="duotone"
                />
              ) : (
                <CloudSlashIcon
                  aria-hidden="true"
                  size={16}
                  weight="duotone"
                />
              )}
              Sync: {networkState}
            </span>
          </div>
          <img
            alt="Ste's Stag logo"
            className="
              size-20 shrink-0 rounded-2xl object-cover
              sm:size-24
            "
            height="96"
            src={stagLogo}
            width="96"
          />
        </div>
        <nav aria-label="Main navigation" className="flex flex-wrap gap-2">
          {navigation.map((item) => (
            <a
              className="btn btn-ghost btn-sm"
              href={item.href}
              key={item.href}
            >
              <item.icon aria-hidden="true" size={16} weight="duotone" />
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
    <main className="grid content-start gap-4">{children}</main>
  </div>
);
