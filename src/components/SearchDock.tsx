"use client";

import SearchBar from "./SearchBar";

export default function SearchDock() {
  return (
    <div className="md:hidden sticky top-[var(--header-h)] z-40 search-dock bg-[color:var(--surface)] border-b border-[color:var(--border)] px-3 sm:px-4 py-2">
      <div className="w-full">
        <SearchBar variant="dock" />
      </div>
    </div>
  );
}
