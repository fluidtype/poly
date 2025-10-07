"use client";

import { useEffect, useState } from "react";

import { CUSTOM_PRESET_EVENT, SEARCH_SUBMIT_EVENT } from "@/components/search/events";
import { cn } from "@/lib/utils";
import {
  twitterDatasetEnabled,
  useGlobalFilters,
} from "@/stores/useGlobalFilters";
import { Search } from "lucide-react";

function parseKeywords(value: string) {
  return value
    .split(/[\s,]+/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

type SearchInputProps = {
  loading?: boolean;
  onSearch?: (keywords: string[]) => void;
  className?: string;
};

export function SearchInput({ loading = false, onSearch, className }: SearchInputProps) {
  const keywords = useGlobalFilters((state) => state.keywords);
  const setKeywords = useGlobalFilters((state) => state.setKeywords);
  const setPreset = useGlobalFilters((state) => state.setPreset);
  const toggleDataset = useGlobalFilters((state) => state.toggleDataset);

  const [query, setQuery] = useState(() => keywords.join(" "));

  useEffect(() => {
    const joined = keywords.join(" ");
    setQuery((current) => (current === joined ? current : joined));
  }, [keywords]);

  const dispatchSearchEvent = (parsed: string[]) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(SEARCH_SUBMIT_EVENT, {
          detail: { keywords: parsed },
        })
      );
    }
  };

  const clearSearch = () => {
    setQuery("");
    setKeywords([]);
    dispatchSearchEvent([]);
  };

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const parsed = parseKeywords(query);
    setKeywords(parsed);
    onSearch?.(parsed);
    dispatchSearchEvent(parsed);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;

    if (key === "Enter") {
      event.preventDefault();
      handleSubmit();
      return;
    }

    if (key === "Escape") {
      event.preventDefault();
      clearSearch();
      return;
    }

    const modifierActive = event.metaKey || event.altKey;

    if (!modifierActive) {
      return;
    }

    switch (key.toLowerCase()) {
      case "7":
        event.preventDefault();
        setPreset("7D");
        break;
      case "3":
        event.preventDefault();
        setPreset("30D");
        break;
      case "9":
        event.preventDefault();
        setPreset("90D");
        break;
      case "c":
        event.preventDefault();
        setPreset("CUSTOM");
        document.dispatchEvent(new CustomEvent(CUSTOM_PRESET_EVENT));
        break;
      case "g":
        event.preventDefault();
        toggleDataset("gdelt");
        break;
      case "p":
        event.preventDefault();
        toggleDataset("polymuffin");
        break;
      case "t":
        if (twitterDatasetEnabled) {
          event.preventDefault();
          toggleDataset("twitter");
        }
        break;
      default:
        break;
    }
  };

  const showClear = query.length > 0;

  const skeletonClass = cn(
    "surface-pill flex h-12 w-full items-center justify-between rounded-3xl px-5",
    "md:h-14",
    className
  );

  return (
    <div className={cn("w-full", className)}>
      {loading ? (
        <div className="animate-pulse">
          <div className={skeletonClass} />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={cn(
            "surface-pill flex items-center rounded-3xl border border-[color:var(--border)]/60 px-5",
            "bg-[color:var(--surface-2)]",
            "h-12 md:h-14",
            "hover:ring-1 hover:ring-[color:var(--primary)]/35",
            "focus-within:ring-2 focus-within:ring-[color:var(--primary)]/45"
          )}
        >
          <button
            type="submit"
            aria-label="Submit search"
            className="mr-3 flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--muted)] transition hover:text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/45"
            disabled={loading}
          >
            <Search className="h-4 w-4" strokeWidth={2} />
          </button>
          <input
            type="text"
            placeholder="Search events or markets"
            aria-label="Search events or markets"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[color:var(--text)] outline-none placeholder:text-[color:var(--muted)]"
          />
          <kbd className="hidden rounded border border-white/10 bg-black/30 px-1.5 py-0.5 text-xs uppercase tracking-wide text-[color:var(--muted)] md:block">
            ⌘K
          </kbd>
          <button
            type="button"
            aria-label="Clear search"
            onClick={clearSearch}
            className={cn(
              "ml-2 text-sm text-[color:var(--muted)] transition",
              "hover:text-[color:var(--text)]",
              !showClear && "pointer-events-none opacity-0"
            )}
            disabled={!showClear}
          >
            ✕
          </button>
        </form>
      )}
    </div>
  );
}
