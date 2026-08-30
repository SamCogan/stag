import { IconWithBadge } from "./IconWithBadge";

import type { Icon } from "@phosphor-icons/react";

interface SectionHeadingProperties {
  badgeIcon?: Icon;
  icon: Icon;
  title: string;
}

export const SectionHeading = ({
  badgeIcon: BadgeIcon,
  icon: HeadingIcon,
  title,
}: SectionHeadingProperties) => (
  <h2 className="card-title flex flex-wrap items-center gap-2">
    <IconWithBadge badgeIcon={BadgeIcon} icon={HeadingIcon} size={24} />
    {title}
  </h2>
);
