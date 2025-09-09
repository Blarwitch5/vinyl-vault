// Helpers pour le thème selon les règles .cursorrules

import { THEME_MODES } from "../types";

// Fonctions utilitaires au lieu de classes
export const createThemeHelper = () => {
  const getStoredTheme = (): string | null => {
    return localStorage.getItem("vinyl-vault-theme");
  };

  const setStoredTheme = (theme: string): void => {
    localStorage.setItem("vinyl-vault-theme", theme);
  };

  const getSystemTheme = (): string => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? THEME_MODES.DARK
      : THEME_MODES.LIGHT;
  };

  const getCurrentTheme = (): string => {
    const stored = getStoredTheme();
    return stored || getSystemTheme();
  };

  const applyTheme = (theme: string): void => {
    const documentElement = document.documentElement;

    if (theme === THEME_MODES.DARK) {
      documentElement.classList.add("dark");
    } else {
      documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = (): string => {
    const currentTheme = getCurrentTheme();
    const newTheme =
      currentTheme === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK;

    setStoredTheme(newTheme);
    applyTheme(newTheme);

    return newTheme;
  };

  const initTheme = (): void => {
    const theme = getCurrentTheme();
    applyTheme(theme);
  };

  const isDarkMode = (): boolean => {
    return getCurrentTheme() === THEME_MODES.DARK;
  };

  return {
    getStoredTheme,
    setStoredTheme,
    getSystemTheme,
    getCurrentTheme,
    applyTheme,
    toggleTheme,
    initTheme,
    isDarkMode,
  };
};
