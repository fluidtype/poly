"use client";

import SearchBar from "./SearchBar";

export default function Header() {
  return (
    <>
      {/* Left: logo */}
      <div className="shrink-0 min-w-[40px] flex items-center">
        {/* TODO: replace with real logo */}
        <span className="font-semibold text-[color:var(--primary)]">A</span>
        <span className="ml-2 hidden md:inline">Poly Broadcast</span>
      </div>

      {/* Center: SearchBar (solo ≥ md), centrata, larghezza controllata */}
      <div className="hidden md:flex w-full justify-center min-w-0">
        <div className="w-full max-w-[760px]">
          <SearchBar variant="inline" />
        </div>
      </div>

      {/* Right: actions */}
      <div className="shrink-0 flex items-center gap-2">
        {/* pulsante filtri/advanced, theme toggle, avatar */}
        <button className="hidden md:inline-flex h-10 items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 text-sm">
          <span className="i-lucide-settings h-4 w-4" /> Advanced
        </button>
        <button
          className="h-10 w-10 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)]"
          aria-label="Theme"
          type="button"
        />
        <div className="h-10 w-10 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-2)]" />
      </div>
    </>
  );
}
