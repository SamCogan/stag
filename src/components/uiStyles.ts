import { cva } from "class-variance-authority";

export const buttonStyles = cva("btn min-h-11 touch-manipulation", {
  defaultVariants: {
    intent: "primary",
    size: "medium",
  },
  variants: {
    intent: {
      danger: "btn-error",
      ghost: "btn-ghost",
      primary: "btn-primary",
      secondary: "btn-secondary",
    },
    size: {
      compact: "btn-sm",
      medium: "btn-md",
    },
  },
});

export const panelStyles = cva(
  "card border border-base-300 bg-base-100 shadow-sm",
);
