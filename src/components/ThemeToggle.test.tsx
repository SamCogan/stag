import { afterEach, expect, spyOn, test } from "bun:test";

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeToggle } from "./ThemeToggle";
import { THEME_STORAGE_KEY } from "../theme";

interface MediaQueryController {
  emit(matches: boolean): void;
  query: MediaQueryList;
}

const createMediaQuery = (initialMatches: boolean): MediaQueryController => {
  let matches = initialMatches;
  let listener: ((event: MediaQueryListEvent) => void) | undefined;
  const query = {
    addEventListener: (
      type: string,
      nextListener: (event: MediaQueryListEvent) => void,
    ) => {
      if (type === "change") {
        listener = nextListener;
      }
    },
    addListener: () => false,
    dispatchEvent: () => true,
    get matches() {
      return matches;
    },
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    removeEventListener: (
      type: string,
      nextListener: (event: MediaQueryListEvent) => void,
    ) => {
      if (type === "change" && listener === nextListener) {
        listener = undefined;
      }
    },
    removeListener: () => false,
  } as unknown as MediaQueryList;

  return {
    emit(nextMatches) {
      matches = nextMatches;
      listener?.({ matches: nextMatches } as MediaQueryListEvent);
    },
    query,
  };
};

afterEach(() => {
  delete globalThis.document.documentElement.dataset["theme"];
  globalThis.document.documentElement.style.removeProperty("color-scheme");
});

test("follows the device theme until a selection is stored", () => {
  const mediaQuery = createMediaQuery(true);
  const matchMedia = spyOn(globalThis, "matchMedia").mockImplementation(
    () => mediaQuery.query,
  );
  const { unmount } = render(<ThemeToggle />);

  try {
    expect(globalThis.document.documentElement.dataset["theme"]).toBe(
      "stag-dark",
    );
    expect(
      screen.getByRole("button", { name: "Switch to light mode" }),
    ).toBeInTheDocument();

    act(() => {
      mediaQuery.emit(false);
    });
    expect(globalThis.document.documentElement.dataset["theme"]).toBe("stag");
    expect(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    ).toBeInTheDocument();
  } finally {
    unmount();
    matchMedia.mockRestore();
  }
});

test("persists an explicit selection across remounts", async () => {
  const mediaQuery = createMediaQuery(false);
  const matchMedia = spyOn(globalThis, "matchMedia").mockImplementation(
    () => mediaQuery.query,
  );
  const user = userEvent.setup();
  const { unmount } = render(<ThemeToggle />);

  try {
    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    );
    expect(globalThis.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(globalThis.document.documentElement.dataset["theme"]).toBe(
      "stag-dark",
    );

    act(() => {
      mediaQuery.emit(false);
    });
    expect(globalThis.document.documentElement.dataset["theme"]).toBe(
      "stag-dark",
    );

    unmount();
    const { unmount: unmountSecond } = render(<ThemeToggle />);
    expect(
      screen.getByRole("button", { name: "Switch to light mode" }),
    ).toBeInTheDocument();
    expect(globalThis.document.documentElement.dataset["theme"]).toBe(
      "stag-dark",
    );
    unmountSecond();
  } finally {
    matchMedia.mockRestore();
  }
});

test("synchronizes theme changes from another browser tab", () => {
  const mediaQuery = createMediaQuery(false);
  const matchMedia = spyOn(globalThis, "matchMedia").mockImplementation(
    () => mediaQuery.query,
  );
  const { unmount } = render(<ThemeToggle />);

  try {
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    act(() => {
      globalThis.dispatchEvent(
        new StorageEvent("storage", {
          key: THEME_STORAGE_KEY,
          newValue: "dark",
          storageArea: globalThis.localStorage,
        }),
      );
    });

    expect(globalThis.document.documentElement.dataset["theme"]).toBe(
      "stag-dark",
    );
    expect(
      screen.getByRole("button", { name: "Switch to light mode" }),
    ).toBeInTheDocument();
  } finally {
    unmount();
    matchMedia.mockRestore();
  }
});
