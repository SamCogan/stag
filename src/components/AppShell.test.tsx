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

  expect(within(desktopNavigation).getAllByRole("link")).toHaveLength(3);
  expect(within(mobileNavigation).getAllByRole("link")).toHaveLength(3);
  expect(
    within(mobileNavigation).getByRole("link", { name: "Stableford Live" }),
  ).toHaveAttribute("aria-current", "page");
  expect(
    within(desktopNavigation).getByRole("link", { name: "Stableford Live" }),
  ).toHaveAttribute("aria-current", "page");
  expect(within(mobileNavigation).getByText("Live")).toBeInTheDocument();
  expect(within(mobileNavigation).getByText("Admin")).toBeInTheDocument();
  expect(
    within(mobileNavigation).getByRole("link", { name: "Home" }),
  ).toHaveAttribute("href", "?mode=home&event=coollattin-stableford");
  expect(
    within(mobileNavigation).queryByRole("link", { name: "Pub Stats" }),
  ).not.toBeInTheDocument();
  expect(
    within(desktopNavigation).queryByRole("link", { name: "Pub Stats" }),
  ).not.toBeInTheDocument();

  unmount();
});

test("retains every event destination outside Coollattin", () => {
  const { unmount } = render(
    <AppShell eventCode="stag2026" mode="home" networkState="local-only">
      <p>Page content</p>
    </AppShell>,
  );

  expect(
    within(
      screen.getByRole("navigation", { name: "Mobile navigation" }),
    ).getAllByRole("link"),
  ).toHaveLength(5);

  unmount();
});
