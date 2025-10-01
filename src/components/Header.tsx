"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Moon, SlidersHorizontal, Sun, User2 } from "lucide-react";

import SearchBar from "@/components/SearchBar";
import useAdvancedModal from "@/stores/useAdvancedModal";

const LogoMark = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary"
  >
    <rect width="28" height="28" rx="8" className="fill-primary/10" />
    <path
      d="M8 19.5L12.2 8H15.9L20 19.5H17.2L16.3 17H11.7L10.8 19.5H8ZM12.4 15H15.6L14 10.4H14L12.4 15Z"
      className="fill-current"
    />
  </svg>
);

const Header = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const advancedOpen = useAdvancedModal((state) => state.open);
  const openAdvanced = useAdvancedModal((state) => state.openModal);
  const closeAdvanced = useAdvancedModal((state) => state.closeModal);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("poly-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: MouseEvent) => {
      if (!mobileMenuRef.current?.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    if (mobileOpen) {
      document.addEventListener("click", handler);
    }

    return () => {
      document.removeEventListener("click", handler);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("poly-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    if (!advancedOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAdvanced();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [advancedOpen, closeAdvanced]);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface)/0.8] backdrop-blur pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-[var(--header-h)] w-full max-w-[1440px] items-center justify-between gap-4 px-5 py-2">
        <div className="flex flex-none items-center gap-3">
          <LogoMark />
          <span className="text-sm font-semibold tracking-wide text-text/80">Poly Broadcast</span>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <div className="w-full max-w-[760px]">
            <SearchBar />
          </div>
        </div>

        <div className="hidden flex-none items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => {
              openAdvanced();
            }}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-surface-2 px-4 text-xs font-medium text-muted transition hover:border-border hover:text-text"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Advanced
          </button>
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface-2 text-muted transition hover:border-border hover:text-text"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface-2 text-muted">
            <User2 className="h-4 w-4" />
          </div>
        </div>

        <div className="relative md:hidden" ref={mobileMenuRef}>
          <button
            type="button"
            aria-label="Open actions"
            onClick={(event) => {
              event.stopPropagation();
              setMobileOpen((openState) => !openState);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-surface-2 text-muted transition hover:border-border hover:text-text"
          >
            <Menu className="h-4 w-4" />
          </button>
          {mobileOpen ? (
            <div
              className="absolute right-0 top-12 w-48 rounded-2xl border border-border/70 bg-surface-2 p-3 shadow-soft"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-surface"
                onClick={() => {
                  openAdvanced();
                  setMobileOpen(false);
                }}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Advanced
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-surface"
                onClick={() => {
                  toggleTheme();
                  setMobileOpen(false);
                }}
              >
                Theme
                <span className="inline-flex items-center gap-2 text-xs">
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Light
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Dark
                    </>
                  )}
                </span>
              </button>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-border/70 bg-surface px-3 py-2 text-sm text-muted">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-surface-2">
                  <User2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text">Alex Doe</p>
                  <p className="text-[11px] text-muted">Product Ops</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {advancedOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeAdvanced}
        >
          <div
            className="w-[min(90%,420px)] rounded-2xl border border-border/70 bg-surface-2 p-6 text-sm text-muted shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text">Advanced filters</h2>
              <button
                type="button"
                className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted transition hover:border-border hover:text-text"
                onClick={closeAdvanced}
              >
                Close
              </button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Configure advanced filters, saved views, and cross-network search boosters here soon.
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
