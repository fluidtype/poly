"use client";

import { useEffect, useState } from "react";

import DatePresets from "@/components/search/DatePresets";
import DatasetToggles from "@/components/search/DatasetToggles";
import { CUSTOM_PRESET_EVENT, SEARCH_SUBMIT_EVENT } from "@/components/search/events";
import { cn } from "@/lib/utils";
import {
  twitterDatasetEnabled,
  useGlobalFilters,
} from "@/stores/useGlobalFilters";
import { Search } from "lucide-react";

const DEBOUNCE_DELAY = 300;

function parseKeywords(value: string) {
  return value
    .split(/[\s,]+/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function keywordsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

type SearchBarProps = {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSearch?: (keywords: string[]) => void;
};

export default function SearchBar({
  loading = false,
  error = null,
  onRetry,
  onSearch,
}: SearchBarProps) {
  const keywords = useGlobalFilters((state) => state.keywords);
  const setKeywords = useGlobalFilters((state) => state.setKeywords);
  const setPreset = useGlobalFilters((state) => state.setPreset);
  const toggleDataset = useGlobalFilters((state) => state.toggleDataset);

  const [query, setQuery] = useState(() => keywords.join(" "));

  useEffect(() => {
    const joined = keywords.join(" ");
    if (joined !== query) {
      setQuery(joined);
    }
  }, [keywords, query]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const parsed = parseKeywords(query);
      if (!keywordsEqual(parsed, keywords)) {
        setKeywords(parsed);
      }
    }, DEBOUNCE_DELAY);

    return () => window.clearTimeout(handle);
  }, [query, keywords, setKeywords]);

  const clearSearch = () => {
    setQuery("");
    setKeywords([]);
  };

  const dispatchSearchEvent = (parsed: string[]) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(SEARCH_SUBMIT_EVENT, {
          detail: { keywords: parsed },
        })
      );
    }
  };

  const handleSubmit = () => {
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

    if (event.metaKey || event.altKey || event.ctrlKey) {
      return;
    }

    switch (key) {
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
      case "C":
        event.preventDefault();
        setPreset("CUSTOM");
        document.dispatchEvent(new CustomEvent(CUSTOM_PRESET_EVENT));
        break;
      case "g":
      case "G":
        event.preventDefault();
        toggleDataset("gdelt");
        break;
      case "p":
      case "P":
        event.preventDefault();
        toggleDataset("poly");
        break;
      case "t":
      case "T":
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
    "md:h-14"
  );

  return (
    <div className="mx-auto w-full max-w-[760px]">
      {loading ? (
        <div className="animate-pulse">
          <div className={skeletonClass} />
        </div>
      ) : (
        <div
          className={cn(
            "surface-pill flex items-center rounded-3xl border border-[color:var(--border)]/60 px-5",
            "bg-[color:var(--surface-2)]",
            "h-12 md:h-14",
            "hover:ring-1 hover:ring-[color:var(--primary)]/35",
            "focus-within:ring-2 focus-within:ring-[color:var(--primary)]/45"
          )}
        >
          <Search className="mr-3 h-4 w-4 opacity-70" strokeWidth={2} />
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
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <DatePresets disabled={loading} />
        <DatasetToggles disabled={loading} />
      </div>

      <div className="pointer-events-none mt-1 h-[2px] rounded-full bg-[radial-gradient(60%_80%_at_50%_50%,rgba(224,36,36,0.45),transparent)]" />

      {error && (
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-100">
          <span>{error}</span>
          {onRetry && (
            <button
              type="button"
              className="rounded-2xl border border-red-500/40 px-3 py-1 text-xs uppercase tracking-wide text-red-100 transition hover:bg-red-500/20"
              onClick={onRetry}
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}

