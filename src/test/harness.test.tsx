import { expect, test } from "bun:test";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ReactElement } from "react";

declare module "bun:test" {
  interface Matchers<T> {
    toBeInTheDocument(this: Matchers<T>): void;
    toHaveAccessibleName(expected: string | RegExp): void;
  }
}

const HarnessProbe = (): ReactElement => {
  const [isReady, setIsReady] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setIsReady(true);
      }}
    >
      {isReady ? "Harness ready" : "Verify harness"}
    </button>
  );
};

test("renders React and handles a user interaction", async () => {
  const user = userEvent.setup();

  render(<HarnessProbe />);

  const button = screen.getByRole("button", { name: "Verify harness" });
  expect(button).toBeInTheDocument();

  await user.click(button);

  expect(button).toHaveAccessibleName("Harness ready");
});
