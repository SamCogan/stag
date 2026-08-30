import { afterEach, expect, test } from "bun:test";

import {
  applyTheme,
  initializeTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
} from "./theme";

afterEach(() => {
  delete globalThis.document.documentElement.dataset["theme"];
  globalThis.document.documentElement.style.removeProperty("color-scheme");
});

test("resolves a stored theme before the device preference", () => {
  expect(resolveTheme("light", true)).toBe("light");
  expect(resolveTheme("dark", false)).toBe("dark");
});

test("defaults missing or invalid selections to the device preference", () => {
  expect(resolveTheme(null, true)).toBe("dark");
  expect(resolveTheme("invalid", false)).toBe("light");
});

test("applies the selected daisyUI theme and browser chrome color", () => {
  const themeColor = globalThis.document.createElement("meta");
  themeColor.name = "theme-color";
  globalThis.document.head.append(themeColor);

  try {
    applyTheme("dark");
    expect(globalThis.document.documentElement.dataset["theme"]).toBe(
      "stag-dark",
    );
    expect(
      globalThis.getComputedStyle(globalThis.document.documentElement)
        .colorScheme,
    ).toBe("dark");
    expect(themeColor.content).toBe("#101a13");

    applyTheme("light");
    expect(globalThis.document.documentElement.dataset["theme"]).toBe("stag");
    expect(
      globalThis.getComputedStyle(globalThis.document.documentElement)
        .colorScheme,
    ).toBe("light");
    expect(themeColor.content).toBe("#d8e7a9");
  } finally {
    themeColor.remove();
  }
});

test("initializes a stored theme before the application renders", () => {
  globalThis.localStorage.setItem(THEME_STORAGE_KEY, "dark");

  expect(initializeTheme()).toBe("dark");
  expect(globalThis.document.documentElement.dataset["theme"]).toBe(
    "stag-dark",
  );
});
