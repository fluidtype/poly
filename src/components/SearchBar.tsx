"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarIcon, Loader2, Search, SlidersHorizontal } from "lucide-react";
import { DateRange, DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import useGlobalFilters, {
  DatasetKey,
  GlobalFiltersState,
  formatDateKey,
  parseDateKey,
  twitterEnabled,
} from "@/stores/useGlobalFilters";

type SearchBarProps = {
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onAdvancedClick?: () => void;
  onFiltersChange?: (state: GlobalFiltersState) => void;
};

type PresetOption = {
  label: string;
  value: "7D" | "30D" | "90D" | "custom";
  days?: number;
};

const PRESETS: PresetOption[] = [
  { label: "7D", value: "7D", days: 7 },
  { label: "30D", value: "30D", days: 30 },
  { label: "90D", value: "90D", days: 90 },
  { label: "Custom", value: "custom" },
];

const msInDay = 1000 * 60 * 60 * 24;

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const clampToStartOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const getPresetFromRange = (start: string, end: string): PresetOption["value"] => {
  const startDate = clampToStartOfDay(parseDateKey(start));
  const endDate = clampToStartOfDay(parseDateKey(end));
  const today = clampToStartOfDay(new Date());
  const diff = Math.round((endDate.getTime() - startDate.getTime()) / msInDay) + 1;

  if (isSameDay(endDate, today)) {
    if (diff === 7) return "7D";
    if (diff === 30) return "30D";
    if (diff === 90) return "90D";
  }

  return "custom";
};

const datasetLabels: Record<DatasetKey, string> = {
  gdelt: "GDELT",
  poly: "Polymarket",
  twitter: "Twitter",
};

const DateRangePopover = ({
  open,
  initialRange,
  onApply,
  onOpenChange,
}: {
  open: boolean;
  initialRange: DateRange | undefined;
  onApply: (range: DateRange | undefined) => void;
  onOpenChange: (next: boolean) => void;
}) => {
  const [range, setRange] = useState<DateRange | undefined>(initialRange);

  useEffect(() => {
    setRange(initialRange);
  }, [initialRange]);

  if (!open) return null;

  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-[320px] rounded-2xl border border-border/80 bg-surface-2 p-4 shadow-soft">
      <DayPicker
        mode="range"
        defaultMonth={initialRange?.from}
        selected={range}
        onSelect={setRange}
        numberOfMonths={1}
        weekStartsOn={1}
        className="rdp text-sm"
        captionLayout="dropdown-buttons"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-sm text-muted transition hover:text-text"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-600"
          onClick={() => {
            onApply(range);
            onOpenChange(false);
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

const SearchBar = ({
  isLoading,
  error,
  onRetry,
  onAdvancedClick,
  onFiltersChange,
}: SearchBarProps) => {
  const {
    keywords,
    dateStart,
    dateEnd,
    datasets,
    setKeywords,
    setDateRange,
    toggleDataset,
  } = useGlobalFilters();

  const [inputValue, setInputValue] = useState(() => keywords.join(" "));
  const [selectedPreset, setSelectedPreset] = useState<PresetOption["value"]>(() =>
    getPresetFromRange(dateStart, dateEnd),
  );
  const [customOpen, setCustomOpen] = useState(false);
  const customPresetRef = useRef<HTMLDivElement>(null);

  const initialCustomRange = useMemo<DateRange | undefined>(() => {
    if (!dateStart || !dateEnd) return undefined;
    return {
      from: parseDateKey(dateStart),
      to: parseDateKey(dateEnd),
    };
  }, [dateStart, dateEnd]);

  useEffect(() => {
    if (!onFiltersChange) return;
    const unsubscribe = useGlobalFilters.subscribe((state) => {
      onFiltersChange(state);
    });
    return () => {
      unsubscribe();
    };
  }, [onFiltersChange]);

  useEffect(() => {
    const text = keywords.join(" ");
    setInputValue((prev) => (prev === text ? prev : text));
  }, [keywords]);

  useEffect(() => {
    setSelectedPreset(getPresetFromRange(dateStart, dateEnd));
  }, [dateStart, dateEnd]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const tokens = inputValue
        .split(/[\s,]+/)
        .map((token) => token.trim())
        .filter(Boolean);
      setKeywords(tokens);
    }, 300);

    return () => clearTimeout(handle);
  }, [inputValue, setKeywords]);

  const handlePreset = useCallback(
    (preset: PresetOption) => {
      if (preset.value === "custom") {
        setCustomOpen((openState) => !openState);
        setSelectedPreset("custom");
        return;
      }

      if (!preset.days) return;
      const end = clampToStartOfDay(new Date());
      const start = new Date(end);
      start.setDate(start.getDate() - (preset.days - 1));

      setDateRange(formatDateKey(start), formatDateKey(end));
      setSelectedPreset(preset.value);
      setCustomOpen(false);
    },
    [setDateRange],
  );

  const handleApplyCustom = useCallback(
    (range: DateRange | undefined) => {
      if (!range?.from || !range?.to) return;
      const from = clampToStartOfDay(range.from);
      const to = clampToStartOfDay(range.to);
      setDateRange(formatDateKey(from), formatDateKey(to));
    },
    [setDateRange],
  );

  const handleDatasetToggle = useCallback(
    (dataset: DatasetKey) => {
      if (dataset === "twitter" && !twitterEnabled) return;
      toggleDataset(dataset);
    },
    [toggleDataset],
  );

  const datasetOptions = useMemo(
    () =>
      (["gdelt", "poly", "twitter"] as DatasetKey[]).map((key) => ({
        key,
        label: datasetLabels[key],
        disabled: key === "twitter" && !twitterEnabled,
        active: datasets[key],
      })),
    [datasets],
  );

  useEffect(() => {
    if (!customOpen) return;
    const handler = (event: MouseEvent) => {
      if (!customPresetRef.current?.contains(event.target as Node)) {
        setCustomOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [customOpen]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex h-12 w-full items-center gap-3 rounded-2xl border border-border/70 bg-surface-2 px-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted" />
          <div className="h-3 flex-1 rounded-full bg-border/80" />
        </div>
        <div className="h-9 w-full rounded-2xl bg-surface-2" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {error ? (
        <div className="flex items-center justify-between rounded-xl border border-primary/50 bg-primary/10 px-4 py-3 text-sm text-primary">
          <span>{error}</span>
          {onRetry ? (
            <button
              type="button"
              className="rounded-lg border border-primary/40 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/10"
              onClick={onRetry}
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="relative flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-surface-2 px-4 py-3 shadow-soft">
        <Search className="h-4 w-4 flex-none text-muted" />
        <input
          className="h-full w-full bg-transparent text-sm text-text placeholder:text-muted focus:outline-none"
          placeholder="Search events or markets"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <button
          type="button"
          className="hidden items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-muted transition hover:border-border hover:text-text md:inline-flex"
          onClick={onAdvancedClick}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Advanced
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((preset) => (
            <div
              key={preset.value}
              className="relative"
              ref={preset.value === "custom" ? customPresetRef : undefined}
            >
              <button
                type="button"
                onClick={() => handlePreset(preset)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  selectedPreset === preset.value
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border/70 bg-surface text-muted hover:border-border hover:text-text",
                )}
              >
                {preset.value === "custom" ? <CalendarIcon className="h-3.5 w-3.5" /> : null}
                {preset.label}
              </button>
              {preset.value === "custom" ? (
                <DateRangePopover
                  open={customOpen}
                  initialRange={initialCustomRange}
                  onApply={handleApplyCustom}
                  onOpenChange={setCustomOpen}
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {datasetOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => handleDatasetToggle(option.key)}
              disabled={option.disabled}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                option.disabled
                  ? "cursor-not-allowed border-border/50 text-muted/50"
                  : option.active
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border/70 bg-surface text-muted hover:border-border hover:text-text",
              )}
            >
              <span>{option.label}</span>
              {option.disabled ? <span className="text-[10px] uppercase text-muted/60">Off</span> : null}
            </button>
          ))}

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium text-muted transition hover:border-border hover:text-text md:hidden"
            onClick={onAdvancedClick}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Advanced
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
