import { expect, mock, spyOn, test } from "bun:test";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StablefordLogin } from "./StablefordLogin";

const locationPrototype = Object.getPrototypeOf(globalThis.location) as Pick<
  Location,
  "assign"
>;

const mockLocationAssign = () => {
  const assignedUrls: (string | URL)[] = [];
  const assign = spyOn(locationPrototype, "assign").mockImplementation(
    (url) => {
      assignedUrls.push(url);
    },
  );

  return { assign, assignedUrls };
};

test("authenticates a normalized player and opens the scorecard", async () => {
  const { assign, assignedUrls } = mockLocationAssign();
  const onAuthenticated = mock(() => true);
  const user = userEvent.setup();
  const { unmount } = render(
    <StablefordLogin onAuthenticated={onAuthenticated} />,
  );

  try {
    await user.type(screen.getByLabelText("Username"), " Sam ");
    await user.type(screen.getByLabelText("Password"), " SAM ");
    await user.click(screen.getByRole("button", { name: "Open My Scorecard" }));

    expect(onAuthenticated).toHaveBeenCalledWith(
      expect.objectContaining({ id: "sam", name: "Sam" }),
    );
    expect(assignedUrls).toEqual([
      "?event=coollattin-stableford&mode=stableford",
    ]);
  } finally {
    unmount();
    assign.mockRestore();
  }
});

test("rejects invalid credentials without navigating", async () => {
  const { assign, assignedUrls } = mockLocationAssign();
  const onAuthenticated = mock(() => true);
  const user = userEvent.setup();
  const { unmount } = render(
    <StablefordLogin onAuthenticated={onAuthenticated} />,
  );

  try {
    await user.type(screen.getByLabelText("Username"), "sam");
    await user.type(screen.getByLabelText("Password"), "ste");
    await user.click(screen.getByRole("button", { name: "Open My Scorecard" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Username or password is incorrect.",
    );
    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(assignedUrls).toHaveLength(0);
  } finally {
    unmount();
    assign.mockRestore();
  }
});
