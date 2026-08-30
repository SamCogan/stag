import { expect, test } from "bun:test";

import { render, screen, within } from "@testing-library/react";

import { AppShell } from "./AppShell";

test("renders a compact mobile dock with active route state", () => {
  const { unmount } = render(
    <AppShell
      eventCode="coollattin-stableford"
      mode="stableford-stats"
      networkState="local-only"
    >
      <p>Page content</p>
    </AppShell>,
  );
  const desktopNavigation = screen.getByRole("navigation", {
    name: "Main navigation",
  });
  const mobileNavigation = screen.getByRole("navigation", {
    name: "Mobile navigation",
  });

  expect(within(desktopNavigation).getAllByRole("link")).toHaveLength(5);
  expect(within(mobileNavigation).getAllByRole("link")).toHaveLength(5);
  expect(
    within(mobileNavigation).getByRole("link", { name: "Stableford Live" }),
  ).toHaveAttribute("aria-current", "page");
  expect(
    within(desktopNavigation).getByRole("link", { name: "Stableford Live" }),
  ).toHaveAttribute("aria-current", "page");
  expect(within(mobileNavigation).getByText("Live")).toBeInTheDocument();
  expect(within(mobileNavigation).getByText("Admin")).toBeInTheDocument();

  unmount();
});
