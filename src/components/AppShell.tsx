import { BeerSteinIcon } from "@phosphor-icons/react/BeerStein";
import { ChartLineUpIcon } from "@phosphor-icons/react/ChartLineUp";
import { FlagPennantIcon } from "@phosphor-icons/react/FlagPennant";
import { GolfIcon } from "@phosphor-icons/react/Golf";
import { HouseLineIcon } from "@phosphor-icons/react/HouseLine";
import { LockSimpleIcon } from "@phosphor-icons/react/LockSimple";
import { WifiHighIcon } from "@phosphor-icons/react/WifiHigh";
import { WifiSlashIcon } from "@phosphor-icons/react/WifiSlash";

import { IconWithBadge } from "./IconWithBadge";
import { ThemeToggle } from "./ThemeToggle";
import { stagLogo } from "../config/assets";

import type { NetworkState } from "../hooks/useEventState";
import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

interface AppShellProperties {
  children: ReactNode;
  eventCode: string;
  mode: string;
  networkState: NetworkState;
}

interface NavigationItem {
  badgeIcon?: Icon;
  href: string;
  icon: Icon;
  label: string;
}

const navigation: readonly NavigationItem[] = [
  { href: "?mode=home", icon: HouseLineIcon, label: "Back to Home" },
  {
    href: "?mode=stats&event=stag2026",
    icon: ChartLineUpIcon,
    label: "Pub Stats",
  },
  {
    href: "?mode=stableford-stats&event=coollattin-stableford",
    icon: GolfIcon,
    label: "Stableford Live",
  },
  {
    href: "?mode=organizer&event=stag2026",
    badgeIcon: LockSimpleIcon,
    icon: BeerSteinIcon,
    label: "Pub Organizer",
  },
  {
    href: "?mode=stableford-org&event=coollattin-stableford",
    badgeIcon: LockSimpleIcon,
    icon: FlagPennantIcon,
    label: "Stableford Organizer",
  },
] as const;

export const AppShell = ({
  children,
  networkState,
}: AppShellProperties) => (
  <div className="min-h-screen bg-base-200 bg-stag-page p-2 font-sans leading-[1.4] text-base-content sm:p-4">
    <div className="mx-auto grid w-full max-w-[1100px] gap-4">
      <header className="rounded-[18px] border border-(--stag-header-border) bg-neutral bg-(image:--stag-header-background) p-[1.4rem] text-neutral-content shadow-(--stag-header-shadow)">
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-widest text-(--stag-header-label) uppercase">
                Live Scoring
              </p>
              <h1 className="text-[1.55rem] leading-[1.4] font-bold text-balance">
                Ste&apos;s Stag 2026
              </h1>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="badge h-8 border-(--stag-header-control-border) bg-(--stag-header-control-background) font-semibold text-neutral-content"
                  aria-live="polite"
                >
                  {networkState === "connected" ? (
                    <WifiHighIcon
                      aria-hidden="true"
                      size={16}
                      weight="duotone"
                    />
                  ) : (
                    <WifiSlashIcon
                      aria-hidden="true"
                      size={16}
                      weight="duotone"
                    />
                  )}
                  Sync: {networkState}
                </span>
                <ThemeToggle />
              </div>
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
          <nav
            aria-label="Main navigation"
            className="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap"
          >
            {navigation.map((item) => (
              <a
                className="btn w-full min-w-0 rounded-full border border-(--stag-header-control-border) bg-(--stag-header-control-background) btn-ghost text-neutral-content btn-sm lg:w-auto"
                href={item.href}
                key={item.href}
              >
                <IconWithBadge
                  badgeIcon={item.badgeIcon}
                  icon={item.icon}
                  size={16}
                />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="grid content-start gap-4">{children}</main>
    </div>
  </div>
);
