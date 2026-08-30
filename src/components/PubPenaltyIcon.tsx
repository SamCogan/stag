import { BeerBottleIcon } from "@phosphor-icons/react/BeerBottle";
import { ProhibitIcon } from "@phosphor-icons/react/Prohibit";
import { SmileySadIcon } from "@phosphor-icons/react/SmileySad";
import { ToiletPaperIcon } from "@phosphor-icons/react/ToiletPaper";

import { IconWithBadge } from "./IconWithBadge";

import type { Icon } from "@phosphor-icons/react";

type PubPenaltyId = "refuse" | "sick" | "spill" | "toilet";

const penaltyIcons: Readonly<Record<Exclude<PubPenaltyId, "refuse">, Icon>> = {
  sick: SmileySadIcon,
  spill: BeerBottleIcon,
  toilet: ToiletPaperIcon,
};

interface PubPenaltyIconProperties {
  penaltyId: PubPenaltyId;
  size?: number;
}

export const PubPenaltyIcon = ({
  penaltyId,
  size = 16,
}: PubPenaltyIconProperties) => {
  if (penaltyId === "refuse") {
    return (
      <IconWithBadge
        badgeIcon={ProhibitIcon}
        icon={BeerBottleIcon}
        size={size}
      />
    );
  }

  const PenaltyIcon = penaltyIcons[penaltyId];
  return <PenaltyIcon aria-hidden="true" size={size} weight="duotone" />;
};
