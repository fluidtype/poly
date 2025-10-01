"use client";

import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";

import { cn } from "@/lib/utils";

type DateRangeOption = "7D" | "30D" | "90D" | "custom";

type DatasetKey = "gdelt" | "polymarket" | "twitter";

type GlobalFiltersState = {
  query: string;
  keywords: string[];
  dateRange: DateRangeOption;
  date_start?: string;
  date_end?: string;
  datasets: Record<DatasetKey, boolean>;
  setQuery: (value: string) => void;
  setDateRange: (value: DateRangeOption) => void;
  setCustomRange: (start?: string, end?: string) => void;
  toggleDataset: (dataset: DatasetKey) => void;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}${month}${day}`;
};

const computeRange = (days: number) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return {
    date_start: formatDate(start),
    date_end: formatDate(end),
  };
};

export const useGlobalFilters = create<GlobalFiltersState>((set) => ({
  query: "",
  keywords: [],
  dateRange: "7D",
  ...computeRange(7),
  datasets: {
    gdelt: true,
    polymarket: true,
    twitter: false,
  },
  setQuery: (value) =>
    set(() => ({
      query: value,
      keywords: value
        .split(/[\s,]+/)
        .map((token) => token.trim())
        .filter(Boolean),
    })),
  setDateRange: (value) =>
    set((state) => {
      if (value === "custom") {
        return {
          dateRange: value,
          date_start: state.date_start,
          date_end: state.date_end,
        };
      }

      const preset = value === "7D" ? computeRange(7) : value === "30D" ? computeRange(30) : computeRange(90);
      return {
        dateRange: value,
        ...preset,
      };
    }),
  setCustomRange: (start, end) =>
    set((state) => {
      if (!start && !end) {
        return state;
      }

      const nextStart = start ?? state.date_start;
      const nextEnd = end ?? state.date_end;

      if (nextStart && nextEnd && nextStart > nextEnd) {
        return {
          dateRange: "custom",
          date_start: nextEnd,
          date_end: nextStart,
        };
      }

      return {
        dateRange: "custom",
        date_start: nextStart,
        date_end: nextEnd,
      };
    }),
  toggleDataset: (dataset) =>
    set((state) => ({
      datasets: {
        ...state.datasets,
        [dataset]: dataset === "twitter" ? state.datasets[dataset] : !state.datasets[dataset],
      },
    })),
}));

const DATE_RANGE_OPTIONS: { label: string; value: DateRangeOption; days?: number }[] = [
  { label: "7D", value: "7D", days: 7 },
  { label: "30D", value: "30D", days: 30 },
  { label: "90D", value: "90D", days: 90 },
  { label: "Custom", value: "custom" },
];

const DATASET_OPTIONS: { label: string; value: DatasetKey; disabled?: boolean }[] = [
  { label: "GDELT", value: "gdelt" },
  { label: "Polymarket", value: "polymarket" },
  { label: "Twitter", value: "twitter", disabled: true },
];

const normalizeInputDate = (value?: string) => {
  if (!value) return undefined;
  return value.replaceAll("-", "");
};

const toInputValue = (value?: string) => {
  if (!value || value.length !== 8) return "";
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
};

export default function SearchBar({ variant = "inline" }: { variant?: "inline" | "dock" }) {
  const inputSize = variant === "inline" ? "h-14" : "h-12";
  const { query, setQuery, dateRange, setDateRange, setCustomRange, date_start, date_end, datasets, toggleDataset } =
    useGlobalFilters((state) => ({
      query: state.query,
      setQuery: state.setQuery,
      dateRange: state.dateRange,
      setDateRange: state.setDateRange,
      setCustomRange: state.setCustomRange,
      date_start: state.date_start,
      date_end: state.date_end,
      datasets: state.datasets,
      toggleDataset: state.toggleDataset,
    }));

  const [value, setValue] = useState(query);
  const [customPanelOpen, setCustomPanelOpen] = useState(false);

  useEffect(() => {
    setValue(query);
  }, [query]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setQuery(value);
    }, 300);

    return () => clearTimeout(handler);
  }, [setQuery, value]);

  useEffect(() => {
    if (dateRange !== "custom") {
      setCustomPanelOpen(false);
    }
  }, [dateRange]);

  const datasetButtons = useMemo(
    () =>
      DATASET_OPTIONS.map((dataset) => {
        const active = datasets[dataset.value];
        return (
          <button
            key={dataset.value}
            type="button"
            onClick={() => !dataset.disabled && toggleDataset(dataset.value)}
            disabled={dataset.disabled}
            aria-pressed={active}
            className={cn(
              "h-8 rounded-full border px-3 text-xs font-medium transition",
              active
                ? "border-[color:var(--primary)] bg-[color:var(--primary)/0.2] text-[color:var(--primary)]"
                : "border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--muted)]",
              dataset.disabled && "cursor-not-allowed opacity-60"
            )}
            title={dataset.disabled ? "Twitter data unavailable in this environment" : undefined}
          >
            {dataset.label}
          </button>
        );
      }),
    [datasets, toggleDataset]
  );

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex items-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-5",
          inputSize
        )}
      >
        <input
          aria-label="Search events or markets"
          className="w-full bg-transparent text-[color:var(--text)] outline-none placeholder-[color:var(--muted)]"
          placeholder="Search events or markets"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button className="ml-2 hidden sm:inline text-sm text-[color:var(--muted)]" type="button">
          Advanced
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {DATE_RANGE_OPTIONS.map((option) => {
            const active = dateRange === option.value;
            const handleClick = () => {
              setDateRange(option.value);
              if (option.value === "custom") {
                setCustomPanelOpen((open) => !open || dateRange !== "custom");
              }
            };

            return (
              <button
                key={option.value}
                type="button"
                onClick={handleClick}
                aria-pressed={active}
                className={cn(
                  "h-8 rounded-full border px-3 text-xs font-medium transition",
                  active
                    ? "border-[color:var(--primary)] bg-[color:var(--primary)/0.2] text-[color:var(--primary)]"
                    : "border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--muted)]"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {dateRange === "custom" && customPanelOpen && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-2">
            <label className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
              <span>Start</span>
              <input
                type="date"
                value={toInputValue(date_start)}
                onChange={(event) => setCustomRange(normalizeInputDate(event.target.value), undefined)}
                className="h-8 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-2 text-[color:var(--text)] outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
              <span>End</span>
              <input
                type="date"
                value={toInputValue(date_end)}
                onChange={(event) => setCustomRange(undefined, normalizeInputDate(event.target.value))}
                className="h-8 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-2 text-[color:var(--text)] outline-none"
              />
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">{datasetButtons}</div>
      </div>
    </div>
  );
}
