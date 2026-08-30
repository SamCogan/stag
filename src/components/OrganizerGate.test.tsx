import { expect, test } from "bun:test";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OrganizerGate } from "./OrganizerGate";

declare module "bun:test" {
  interface Matchers<T> {
    toBeInTheDocument(this: Matchers<T>): void;
    toHaveTextContent(this: Matchers<T>, expected: string | RegExp): void;
  }
}

const ORGANIZER_SESSION_KEY = "organizer-auth-v1";
const ORGANIZER_CONTENT = "Organizer controls";

const renderOrganizerGate = () =>
  render(
    <OrganizerGate>
      <p>{ORGANIZER_CONTENT}</p>
    </OrganizerGate>,
  );

test("starts locked without a persisted organizer session", () => {
  const { unmount } = renderOrganizerGate();

  expect(
    screen.getByRole("heading", { name: "Organizer Access" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Organizer Password")).toBeInTheDocument();
  expect(screen.queryByText(ORGANIZER_CONTENT)).not.toBeInTheDocument();
  expect(globalThis.sessionStorage.getItem(ORGANIZER_SESSION_KEY)).toBeNull();
  unmount();
});

test("shows an error and stays locked for the wrong organizer password", async () => {
  const user = userEvent.setup();
  const { unmount } = renderOrganizerGate();

  try {
    await user.type(screen.getByLabelText("Organizer Password"), "cogee87");
    await user.click(
      screen.getByRole("button", { name: "Unlock Organizer Page" }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Wrong organizer password.",
    );
    expect(screen.queryByText(ORGANIZER_CONTENT)).not.toBeInTheDocument();
    expect(globalThis.sessionStorage.getItem(ORGANIZER_SESSION_KEY)).toBeNull();
  } finally {
    unmount();
  }
});

test("unlocks and persists the organizer session for cogee88", async () => {
  const user = userEvent.setup();
  const { unmount } = renderOrganizerGate();

  try {
    await user.type(screen.getByLabelText("Organizer Password"), "cogee88");
    await user.click(
      screen.getByRole("button", { name: "Unlock Organizer Page" }),
    );

    expect(screen.getByText(ORGANIZER_CONTENT)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Lock Organizer" }),
    ).toBeInTheDocument();
    expect(globalThis.sessionStorage.getItem(ORGANIZER_SESSION_KEY)).toBe("ok");
  } finally {
    unmount();
  }
});

test("unlocks immediately from a persisted organizer session", () => {
  globalThis.sessionStorage.setItem(ORGANIZER_SESSION_KEY, "ok");

  const { unmount } = renderOrganizerGate();

  expect(screen.getByText(ORGANIZER_CONTENT)).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Organizer Access" }),
  ).not.toBeInTheDocument();
  unmount();
});

test("locks the organizer and clears the persisted session", async () => {
  globalThis.sessionStorage.setItem(ORGANIZER_SESSION_KEY, "ok");
  const user = userEvent.setup();
  const { unmount } = renderOrganizerGate();

  try {
    await user.click(screen.getByRole("button", { name: "Lock Organizer" }));

    expect(
      screen.getByRole("heading", { name: "Organizer Access" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(ORGANIZER_CONTENT)).not.toBeInTheDocument();
    expect(globalThis.sessionStorage.getItem(ORGANIZER_SESSION_KEY)).toBeNull();
  } finally {
    unmount();
  }
});
