import type { Icon } from "@phosphor-icons/react";

interface IconWithBadgeProperties {
  badgeIcon?: Icon | undefined;
  icon: Icon;
  size: number;
}

export const IconWithBadge = ({
  badgeIcon: BadgeIcon,
  icon: BaseIcon,
  size,
}: IconWithBadgeProperties) => (
  <span className="relative inline-flex shrink-0">
    <BaseIcon aria-hidden="true" size={size} weight="duotone" />
    {BadgeIcon !== undefined && (
      <span className="absolute -right-1.5 -bottom-1 grid place-items-center rounded-full bg-current/20 p-0.5">
        <BadgeIcon
          aria-hidden="true"
          size={Math.max(9, Math.round(size * 0.42))}
          weight="bold"
        />
      </span>
    )}
  </span>
);
