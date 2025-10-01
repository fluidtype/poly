"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { useGlobalFilters, twitterDatasetEnabled } from "@/stores/useGlobalFilters";

type SearchBarProps = {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const debounceDelay = 300;

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function formatDateForInput(value: string) {
  if (value.length !== 8) {
    return "";
  }

  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  return `${year}-${month}-${day}`;
}

function parseDateFromInput(value: string) {
  return value.replaceAll("-", "");
}

function getPresetRange(days: number) {
  const now = new Date();
  const end = formatDate(now);
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - (days - 1));
  const start = formatDate(startDate);
  return { start, end };
}

const datePresets = [
  { label: "7D", range: () => getPresetRange(7) },
  { label: "30D", range: () => getPresetRange(30) },
  { label: "90D", range: () => getPresetRange(90) },
] as const;

export default function SearchBar({ loading = false, error = null, onRetry }: SearchBarProps) {
  const keywords = useGlobalFilters((state) => state.keywords);
  const dateStart = useGlobalFilters((state) => state.dateStart);
  const dateEnd = useGlobalFilters((state) => state.dateEnd);
  const datasets = useGlobalFilters((state) => state.datasets);
  const setKeywords = useGlobalFilters((state) => state.setKeywords);
  const setDateRange = useGlobalFilters((state) => state.setDateRange);
  const toggleDataset = useGlobalFilters((state) => state.toggleDataset);

  const [query, setQuery] = useState(() => keywords.join(" "));
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState(dateStart);
  const [customEnd, setCustomEnd] = useState(dateEnd);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    setQuery(keywords.join(" "));
  }, [keywords]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const parsed = query
        .split(/[\s,]+/)
        .map((value) => value.trim())
        .filter(Boolean);

      const sameLength = parsed.length === keywords.length;
      const sameValues = sameLength && parsed.every((value, index) => value === keywords[index]);

      if (!sameValues) {
        setKeywords(parsed);
      }
    }, debounceDelay);

    return () => clearTimeout(handle);
  }, [query, keywords, setKeywords]);

  useEffect(() => {
    if (!isCustomOpen) {
      setCustomStart(dateStart);
      setCustomEnd(dateEnd);
    }
  }, [dateEnd, dateStart, isCustomOpen]);

  const isCustomRangeActive = useMemo(() => {
    return !datePresets.some(({ range }) => {
      const { start, end } = range();
      return start === dateStart && end === dateEnd;
    });
  }, [dateStart, dateEnd]);

  const filtersDisabled = loading;

  const presetButtons = datePresets.map(({ label, range }) => {
    const { start, end } = range();
    const active = start === dateStart && end === dateEnd;
    return (
      <button
        key={label}
        type="button"
        disabled={filtersDisabled}
        onClick={() => setDateRange(start, end)}
        className={cn(
          "rounded-xl px-3 py-1.5 text-sm transition",
          "bg-[color:var(--surface-2)] text-[color:var(--muted)] hover:bg-[color:var(--primary-600)]/20",
          active &&
            "bg-[color:var(--primary)]/20 text-[color:var(--text)] ring-1 ring-[color:var(--primary)]/40",
          filtersDisabled && "opacity-50"
        )}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  });

  const customButton = (
    <button
      key="custom"
      type="button"
      disabled={filtersDisabled}
      onClick={() => setIsCustomOpen(true)}
      className={cn(
        "rounded-xl px-3 py-1.5 text-sm transition",
        "bg-[color:var(--surface-2)] text-[color:var(--muted)] hover:bg-[color:var(--primary-600)]/20",
        isCustomRangeActive &&
          "bg-[color:var(--primary)]/20 text-[color:var(--text)] ring-1 ring-[color:var(--primary)]/40",
        filtersDisabled && "opacity-50"
      )}
      aria-pressed={isCustomRangeActive}
    >
      Custom
    </button>
  );

  const datasetButtons = [
    { key: "gdelt" as const, label: "GDELT" },
    { key: "poly" as const, label: "Polymarket" },
    ...(twitterDatasetEnabled ? ([{ key: "twitter" as const, label: "Twitter" }] as const) : []),
  ].map(({ key, label }) => {
    const active = datasets[key];
    return (
      <button
        key={key}
        type="button"
        disabled={filtersDisabled || (key === "twitter" && !twitterDatasetEnabled)}
        onClick={() => toggleDataset(key)}
        className={cn(
          "rounded-xl px-3 py-1.5 text-sm transition",
          "bg-[color:var(--surface-2)] text-[color:var(--muted)] hover:bg-[color:var(--primary-600)]/20",
          active &&
            "bg-[color:var(--primary)]/20 text-[color:var(--text)] ring-1 ring-[color:var(--primary)]/40",
          filtersDisabled && "opacity-50"
        )}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  });

  return (
    <div className="w-full max-w-[760px]">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-12 rounded-3xl bg-[color:var(--surface-2)]/80 lg:h-14" />
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center rounded-3xl px-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition",
            "bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0.15)_100%)]",
            "border border-[color:var(--border)]/60",
            "h-12 lg:h-14",
            "hover:ring-1 hover:ring-[color:var(--primary)]/35",
            "focus-within:ring-1 focus-within:ring-[color:var(--primary)]/35"
          )}
        >
          <input
            aria-label="Search events or markets"
            placeholder="Search events or markets"
            className="w-full bg-transparent text-[color:var(--text)] outline-none placeholder-[color:var(--muted)]"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            className="ml-2 hidden text-sm text-[color:var(--muted)] transition hover:text-[color:var(--text)] lg:inline"
            onClick={() => setIsAdvancedOpen(true)}
            disabled={loading}
          >
            Advanced
          </button>
        </div>
      )}

      {error ? (
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          <span>{error}</span>
          <button
            type="button"
            className="rounded-lg border border-red-500/50 px-3 py-1 text-xs uppercase tracking-wide text-red-100 transition hover:bg-red-500/20"
            onClick={onRetry}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted)]">
          <div className="flex flex-wrap items-center gap-2">
            {presetButtons}
            {customButton}
          </div>
          <span className="hidden h-5 w-px bg-[color:var(--border)]/60 sm:block" />
          <div className="flex flex-wrap items-center gap-2">{datasetButtons}</div>
          <button
            type="button"
            className={cn(
              "ml-auto rounded-xl px-3 py-1.5 text-sm transition",
              "bg-[color:var(--surface-2)] text-[color:var(--muted)] hover:bg-[color:var(--primary-600)]/20",
              filtersDisabled && "opacity-50"
            )}
            onClick={() => setIsAdvancedOpen(true)}
            disabled={filtersDisabled}
          >
            Advanced
          </button>
        </div>
      )}

      {isCustomOpen && (
        <div className="mt-3 rounded-2xl border border-[color:var(--border)]/70 bg-[color:var(--surface)]/80 p-4 text-sm shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex flex-1 flex-col gap-1 text-xs uppercase tracking-wide text-[color:var(--muted)]">
              Start
              <input
                type="date"
                value={formatDateForInput(customStart)}
                onChange={(event) => {
                  const value = parseDateFromInput(event.target.value);
                  setCustomStart(value);
                }}
                className="rounded-xl border border-[color:var(--border)]/70 bg-[color:var(--surface-2)] px-3 py-2 text-[color:var(--text)]"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs uppercase tracking-wide text-[color:var(--muted)]">
              End
              <input
                type="date"
                value={formatDateForInput(customEnd)}
                onChange={(event) => {
                  const value = parseDateFromInput(event.target.value);
                  setCustomEnd(value);
                }}
                className="rounded-xl border border-[color:var(--border)]/70 bg-[color:var(--surface-2)] px-3 py-2 text-[color:var(--text)]"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2 text-xs uppercase tracking-wide">
            <button
              type="button"
              className="rounded-xl border border-[color:var(--border)]/70 px-3 py-1.5 text-[color:var(--muted)] transition hover:bg-[color:var(--primary-600)]/10"
              onClick={() => setIsCustomOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-xl bg-[color:var(--primary)]/80 px-3 py-1.5 text-[color:var(--text)] shadow-[0_6px_25px_rgba(224,36,36,0.35)] transition hover:bg-[color:var(--primary)]"
              onClick={() => {
                const startValue = customStart;
                const endValue = customEnd;
                if (!startValue || !endValue) {
                  return;
                }

                const ordered = startValue <= endValue ? [startValue, endValue] : [endValue, startValue];
                setDateRange(ordered[0], ordered[1]);
                setIsCustomOpen(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {isAdvancedOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
          role="presentation"
          onClick={() => setIsAdvancedOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="advanced-search-title"
            className="w-full max-w-lg rounded-3xl border border-[color:var(--border)]/70 bg-[color:var(--surface)] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 id="advanced-search-title" className="text-lg font-semibold text-[color:var(--text)]">
                Advanced search
              </h2>
              <button
                type="button"
                className="rounded-full border border-[color:var(--border)]/70 px-3 py-1 text-xs text-[color:var(--muted)] transition hover:bg-[color:var(--primary-600)]/20"
                onClick={() => setIsAdvancedOpen(false)}
              >
                Close
              </button>
            </div>
            <p className="mt-4 text-sm text-[color:var(--muted)]">
              Configure advanced filters and saved searches. This is a placeholder for future enhancements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
