import { MoonStarsIcon } from "@phosphor-icons/react/MoonStars";
import { SunIcon } from "@phosphor-icons/react/Sun";
import { useEffect, useState } from "react";

import {
  applyTheme,
  DARK_THEME_MEDIA_QUERY,
  getInitialTheme,
  getStoredTheme,
  getSystemTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "../theme";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<ThemePreference>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia(DARK_THEME_MEDIA_QUERY);
    const handleSystemThemeChange = (event: MediaQueryListEvent): void => {
      if (getStoredTheme() === undefined) {
        setTheme(event.matches ? "dark" : "light");
      }
    };
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key !== null && event.key !== THEME_STORAGE_KEY) {
        return;
      }
      setTheme(getStoredTheme() ?? getSystemTheme(mediaQuery));
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    globalThis.addEventListener("storage", handleStorageChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
      globalThis.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = `Switch to ${nextTheme} mode`;

  return (
    <button
      aria-label={label}
      className="btn size-8 min-h-0 min-w-0 rounded-full border border-(--stag-header-control-border) bg-(--stag-header-control-background) btn-ghost p-0 text-neutral-content btn-sm"
      onClick={() => {
        globalThis.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }}
      title={label}
      type="button"
    >
      {theme === "dark" ? (
        <SunIcon aria-hidden="true" size={16} weight="duotone" />
      ) : (
        <MoonStarsIcon aria-hidden="true" size={16} weight="duotone" />
      )}
    </button>
  );
};
