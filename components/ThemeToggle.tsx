"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return null;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    const resolved = stored ?? getSystemTheme();
    setTheme(resolved);
    applyTheme(resolved);
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (!getStoredTheme()) {
        const sys = getSystemTheme();
        setTheme(sys);
        applyTheme(sys);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("theme", next);
  }

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors cursor-pointer"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
