/**
 * Bitasmbl Refactor: Theme Persistence Store
 * Addresses: Misplaced logic in App root & missing persistence.
 */

const THEME_KEY = "bitasmbl_theme_preference";
const DEFAULT_THEME = "light";

// Helper to safely interact with LocalStorage (handles SSR/Privacy Mode)
const getStoredTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  } catch (error) {
    console.warn("Bitasmbl: Failed to read theme from storage", error);
    return DEFAULT_THEME;
  }
};

const setStoredTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  } catch (error) {
    console.error("Bitasmbl: Failed to persist theme", error);
  }
};

// Simple Vanilla Store (Can be used with useSyncExternalStore in React)
let currentState = {
  theme: getStoredTheme(),
};

const listeners = new Set();

export const themeStore = {
  getTheme: () => currentState.theme,

  toggleTheme: () => {
    const nextTheme = currentState.theme === "light" ? "dark" : "light";
    currentState = { ...currentState, theme: nextTheme };

    // Persist the change
    setStoredTheme(nextTheme);

    // Notify all UI components
    listeners.forEach((listener) => listener(currentState));

    // Apply class to document for CSS targeting
    document.documentElement.setAttribute("data-theme", nextTheme);
  },

  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

// Initial application of theme to prevent "Flash of Unstyled Content" (FOUC)
document.documentElement.setAttribute("data-theme", currentState.theme);
