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
  activeModes: readonly string[];
  badgeIcon?: Icon;
  href: string;
  icon: Icon;
  label: string;
  mobileLabel: string;
}

const navigation: readonly NavigationItem[] = [
  {
    activeModes: ["home"],
    href: "?mode=home",
    icon: HouseLineIcon,
    label: "Home",
    mobileLabel: "Home",
  },
  {
    activeModes: ["stats"],
    href: "?mode=stats&event=stag2026",
    icon: ChartLineUpIcon,
    label: "Pub Stats",
    mobileLabel: "Pub",
  },
  {
    activeModes: ["stableford-stats"],
    href: "?mode=stableford-stats&event=coollattin-stableford",
    icon: GolfIcon,
    label: "Stableford Live",
    mobileLabel: "Live",
  },
  {
    activeModes: ["organizer"],
    href: "?mode=organizer&event=stag2026",
    badgeIcon: LockSimpleIcon,
    icon: BeerSteinIcon,
    label: "Pub Organizer",
    mobileLabel: "Pub Admin",
  },
  {
    activeModes: ["stableford-org"],
    href: "?mode=stableford-org&event=coollattin-stableford",
    badgeIcon: LockSimpleIcon,
    icon: FlagPennantIcon,
    label: "Stableford Organizer",
    mobileLabel: "Admin",
  },
] as const;

interface NavigationProperties {
  mode: string;
}

const DesktopNavigation = ({ mode }: NavigationProperties) => (
  <nav
    aria-label="Main navigation"
    className="sticky top-4 hidden rounded-2xl border border-base-300 bg-base-100 p-2 shadow-(--stag-panel-shadow) md:block"
  >
    <ul className="menu w-full gap-1 p-0">
      {navigation.map((item) => {
        const isActive = item.activeModes.includes(mode);
        return (
          <li key={item.href}>
            <a
              aria-current={isActive ? "page" : undefined}
              className={
                isActive ? "bg-primary text-primary-content" : undefined
              }
              href={item.href}
            >
              <IconWithBadge
                badgeIcon={item.badgeIcon}
                icon={item.icon}
                size={18}
              />
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  </nav>
);

const MobileNavigation = ({ mode }: NavigationProperties) => (
  <nav
    aria-label="Mobile navigation"
    className="dock z-50 border-t border-base-300 bg-base-100/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-base-content shadow-lg backdrop-blur-md md:hidden"
  >
    {navigation.map((item) => {
      const isActive = item.activeModes.includes(mode);
      return (
        <a
          aria-current={isActive ? "page" : undefined}
          aria-label={item.label}
          className={isActive ? "bg-primary text-primary-content" : undefined}
          href={item.href}
          key={item.href}
        >
          <IconWithBadge
            badgeIcon={item.badgeIcon}
            icon={item.icon}
            size={20}
          />
          <span className="dock-label text-[0.68rem] font-semibold whitespace-nowrap">
            {item.mobileLabel}
          </span>
        </a>
      );
    })}
  </nav>
);

export const AppShell = ({
  children,
  mode,
  networkState,
}: AppShellProperties) => (
  <div className="min-h-screen bg-base-200 bg-stag-page p-2 pb-24 font-sans leading-[1.4] text-base-content sm:p-4 sm:pb-24 md:pb-4">
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
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-[13rem_minmax(0,1fr)] md:items-start">
        <DesktopNavigation mode={mode} />
        <main className="grid min-w-0 content-start gap-4">{children}</main>
      </div>
    </div>
    <MobileNavigation mode={mode} />
  </div>
);
