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
      "rounded-2xl shadow-(--stag-panel-shadow) [&_h2]:text-xl [&_h2]:text-(--stag-heading) sm:[&_h2]:text-2xl [&_input]:text-base [&_select]:text-base",
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
