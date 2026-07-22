"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type ThemeMode = "light" | "system" | "dark";

const ThemeContext = createContext<{
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (m: ThemeMode) => void;
}>({ mode: "light", resolved: "light", setMode: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("unicconnect-theme");
  if (saved === "light" || saved === "system" || saved === "dark") return saved;
  return "light";
}

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [systemPref, setSystemPref] = useState<"light" | "dark">(getSystemPreference);

  const resolved = mode === "system" ? systemPref : mode;

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem("unicconnect-theme", m);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemPref(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
