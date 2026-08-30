import { mergeClasses } from "../lib/mergeClasses";

interface PlayerHeadshotProperties {
  image?: string;
  initials: string;
  name: string;
  size?: "small" | "medium" | "large";
}

const sizeClasses = {
  large: "size-20 text-xl",
  medium: "size-12 text-sm",
  small: "size-9 text-xs",
} as const;

export const PlayerHeadshot = ({
  image,
  initials,
  name,
  size = "medium",
}: PlayerHeadshotProperties) => {
  const pixels = { large: 80, medium: 48, small: 36 }[size];
  const classes = mergeClasses(
    "shrink-0 rounded-full border-2 border-base-300 bg-primary font-bold text-primary-content",
    sizeClasses[size],
  );

  return image === undefined ? (
    <span
      aria-label={`${name} placeholder photo`}
      className={mergeClasses(classes, "grid place-items-center")}
      role="img"
    >
      {initials}
    </span>
  ) : (
    <img
      alt={name}
      className={mergeClasses(classes, "object-cover")}
      height={pixels}
      loading="lazy"
      src={image}
      width={pixels}
    />
  );
};
