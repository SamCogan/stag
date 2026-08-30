import { BeerSteinIcon } from "@phosphor-icons/react/BeerStein";
import { ChartLineUpIcon } from "@phosphor-icons/react/ChartLineUp";
import { FlagPennantIcon } from "@phosphor-icons/react/FlagPennant";
import { GolfIcon } from "@phosphor-icons/react/Golf";
import { HouseLineIcon } from "@phosphor-icons/react/HouseLine";
import { WifiHighIcon } from "@phosphor-icons/react/WifiHigh";
import { WifiSlashIcon } from "@phosphor-icons/react/WifiSlash";

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
  { href: "?mode=home", icon: HouseLineIcon, label: "Back to Home" },
  {
    href: "?mode=stats&event=stag2026",
    icon: ChartLineUpIcon,
    label: "Pub Stats",
  },
  {
    href: "?mode=stroke-stats&event=vilasol",
    icon: GolfIcon,
    label: "Stroke Stats",
  },
  {
    href: "?mode=organizer&event=stag2026",
    icon: BeerSteinIcon,
    label: "Pub Organizer",
  },
  {
    href: "?mode=stroke-org&event=vilasol",
    icon: FlagPennantIcon,
    label: "Golf Organizer",
  },
] as const;

export const AppShell = ({
  children,
  networkState,
}: AppShellProperties) => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(255,243,214,0.7),transparent_36%),radial-gradient(circle_at_85%_0%,rgba(205,168,92,0.25),transparent_28%),linear-gradient(165deg,#edf4de_0%,#dbe9ca_42%,#c7dcaf_100%)] p-2 font-sans leading-[1.4] text-base-content sm:p-4">
    <div className="mx-auto grid w-full max-w-[1100px] gap-4">
      <header className="rounded-[18px] border border-[#d0e6ac59] bg-[linear-gradient(120deg,rgba(17,40,24,0.95),rgba(41,80,50,0.9))] p-[1.4rem] text-neutral-content shadow-[0_16px_36px_rgba(16,36,20,0.3)]">
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-widest text-[#d9e8b9] uppercase">
                Live Scoring
              </p>
              <h1 className="text-[1.55rem] leading-[1.4] font-bold text-balance">
                Ste&apos;s Stag 2026
              </h1>
              <span
                className="mt-3 badge border-[#cce1ab80] bg-[#0b1c1057] font-semibold text-neutral-content"
                aria-live="polite"
              >
                {networkState === "connected" ? (
                  <WifiHighIcon aria-hidden="true" size={16} weight="duotone" />
                ) : (
                  <WifiSlashIcon
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
                className="btn rounded-full border border-[#cce1ab80] bg-[#0b1c1057] btn-ghost text-neutral-content btn-sm"
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
  </div>
);
