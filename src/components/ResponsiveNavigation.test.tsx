import { expect, test } from "bun:test";

import { render, screen, within } from "@testing-library/react";

import { AppShell } from "./AppShell";

test("renders readable active states in mobile and desktop navigation", () => {
  const { unmount } = render(
    <AppShell eventCode="stag2026" mode="stats" networkState="local-only">
      <p>Page content</p>
    </AppShell>,
  );
  const desktopNavigation = screen.getByRole("navigation", {
    name: "Main navigation",
  });
  const mobileNavigation = screen.getByRole("navigation", {
    name: "Mobile navigation",
  });
  const desktopActiveLink = within(desktopNavigation).getByRole("link", {
    name: "Pub Stats",
  });
  const mobileActiveLink = within(mobileNavigation).getByRole("link", {
    name: "Pub Stats",
  });

  expect(within(desktopNavigation).getAllByRole("link")).toHaveLength(5);
  expect([...desktopNavigation.classList]).toContain("md:block");
  expect([...mobileNavigation.classList]).toContain("md:hidden");
  for (const link of [desktopActiveLink, mobileActiveLink]) {
    expect(link).toHaveAttribute("aria-current", "page");
    expect(
      ["bg-primary", "text-primary-content"].every((className) =>
        link.classList.contains(className),
      ),
    ).toBe(true);
  }

  unmount();
});
