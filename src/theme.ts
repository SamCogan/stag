export const THEME_STORAGE_KEY = "stag-theme";
export const DARK_THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export type ThemePreference = "dark" | "light";

const themeNames: Record<ThemePreference, string> = {
  dark: "stag-dark",
  light: "stag",
};

const browserThemeColors: Record<ThemePreference, string> = {
  dark: "#101a13",
  light: "#d8e7a9",
};

const parseTheme = (value: string | null): ThemePreference | undefined =>
  value === "dark" || value === "light" ? value : undefined;

export const resolveTheme = (
  storedTheme: string | null,
  prefersDark: boolean,
): ThemePreference =>
  parseTheme(storedTheme) ?? (prefersDark ? "dark" : "light");

export const getStoredTheme = (): ThemePreference | undefined =>
  parseTheme(globalThis.localStorage.getItem(THEME_STORAGE_KEY));

export const getSystemTheme = (
  mediaQuery = globalThis.matchMedia(DARK_THEME_MEDIA_QUERY),
): ThemePreference => (mediaQuery.matches ? "dark" : "light");

export const getInitialTheme = (): ThemePreference =>
  getStoredTheme() ?? getSystemTheme();

export const applyTheme = (theme: ThemePreference): void => {
  const root = globalThis.document.documentElement;
  root.dataset["theme"] = themeNames[theme];
  root.style.colorScheme = theme;
  globalThis.document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", browserThemeColors[theme]);
};

export const initializeTheme = (): ThemePreference => {
  const theme = getInitialTheme();
  applyTheme(theme);
  return theme;
};
