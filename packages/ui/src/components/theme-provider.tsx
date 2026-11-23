import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  defaultTheme: Theme;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  defaultTheme: "system",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Blocked site data (a private window, a strict policy) makes localStorage
// throw; the page still mounts, with the default theme and no memory of it.
function readTheme(storageKey: string): Theme | null {
  try {
    return localStorage.getItem(storageKey) as Theme | null;
  } catch {
    return null;
  }
}

function writeTheme(storageKey: string, theme: Theme) {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // The choice holds for this visit only.
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => readTheme(storageKey) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      writeTheme(storageKey, theme);
      setTheme(theme);
    },
    defaultTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
