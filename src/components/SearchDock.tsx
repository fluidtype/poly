"use client";

import SearchBar from "@/components/SearchBar";

const SearchDock = () => {
  return (
    <div className="md:hidden sticky top-[var(--header-h)] z-40 bg-[color:var(--surface)] border-b border-[color:var(--border)] px-4 py-2">
      <div className="w-full">
        <SearchBar />
      </div>
    </div>
  );
};

export default SearchDock;
