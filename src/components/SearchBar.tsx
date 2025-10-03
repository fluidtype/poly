"use client";

import { useEffect, useState } from "react";

import AdvancedModal from "@/components/gdelt/AdvancedModal";
import DatePresets from "@/components/search/DatePresets";
import DatasetToggles from "@/components/search/DatasetToggles";
import { CUSTOM_PRESET_EVENT, SEARCH_SUBMIT_EVENT } from "@/components/search/events";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  twitterDatasetEnabled,
  useGlobalFilters,
} from "@/stores/useGlobalFilters";
import { Search } from "lucide-react";

type SearchBarProps = {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSearch?: (keywords: string[]) => void;
};

function parseKeywords(value: string) {
  return value
    .split(/[\s,]+/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

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
  const [advancedOpen, setAdvancedOpen] = useState(false);

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
        toggleDataset("poly");
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
    "surface-pill flex h-14 w-full items-center justify-between rounded-3xl px-5",
    "sm:h-12"
  );

  return (
    <div className="mx-auto w-full max-w-[760px]">
      {loading ? (
        <div className="animate-pulse">
          <div className={skeletonClass} />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={cn(
            "surface-pill flex h-14 items-center gap-4 rounded-3xl border border-[rgb(var(--borderc))]/60 px-5",
            "sm:h-12",
            "bg-[rgb(var(--surface2))]",
            "hover:ring-1 hover:ring-[rgb(var(--brand))]/35",
            "focus-within:ring-2 focus-within:ring-[rgb(var(--brand))]/45"
          )}
        >
          <button
            type="submit"
            aria-label="Submit search"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--surface3))]/60 text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]/45 sm:h-9 sm:w-9"
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
            className="min-w-0 w-full bg-transparent text-[15px] text-[rgb(var(--text))] outline-none placeholder:text-[rgb(var(--muted))]"
          />
          <div className="flex items-center gap-3">
            <kbd className="hidden rounded border border-white/10 bg-black/30 px-1.5 py-0.5 text-xs uppercase tracking-wide text-[rgb(var(--muted))] md:block">
              ⌘K
            </kbd>
            <button
              type="button"
              aria-label="Clear search"
              onClick={clearSearch}
              className={cn(
                "text-sm text-[rgb(var(--muted))] transition",
                "hover:text-[rgb(var(--text))]",
                !showClear && "pointer-events-none opacity-0"
              )}
              disabled={!showClear}
            >
              ✕
            </button>
          </div>
        </form>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <DatePresets disabled={loading} />
        <DatasetToggles disabled={loading} />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-2xl border border-transparent bg-[rgb(var(--surface3))]/70 px-3 text-[13px] text-[rgb(var(--muted))] transition hover:border-[rgb(var(--brand))]/35 hover:bg-[rgb(var(--brand))]/12 hover:text-[rgb(var(--text))]"
          disabled={loading}
          onClick={() => setAdvancedOpen(true)}
        >
          Advanced
        </Button>
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
      <AdvancedModal open={advancedOpen} onOpenChange={setAdvancedOpen} />
    </div>
  );
}
