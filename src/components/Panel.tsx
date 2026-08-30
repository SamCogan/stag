import { mergeClasses } from "../lib/mergeClasses";

import type { ReactNode } from "react";

interface PanelProperties {
  children: ReactNode;
  className?: string;
}

export const Panel = ({ children, className }: PanelProperties) => (
  <section
    className={mergeClasses(
      "card border border-base-300 bg-base-100 shadow-sm",
      className,
    )}
  >
    <div
      className="
      card-body gap-4 p-4
      sm:p-6
    "
    >
      {children}
    </div>
  </section>
);
