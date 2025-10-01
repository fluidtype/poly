"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { CUSTOM_PRESET_EVENT } from "@/components/search/events";
import { cn } from "@/lib/utils";
import {
  Preset,
  presetRange,
  useGlobalFilters,
  utcYYYYMMDD,
} from "@/stores/useGlobalFilters";

const chipClass = cn(
  "rounded-2xl px-3 py-1.5 text-[13px] transition-all",
  "bg-[color:var(--surface-2)]/90 border border-[color:var(--border)]/60",
  "text-[color:var(--muted)] hover:bg-[color:var(--primary-600)]/15 hover:text-[color:var(--text)]",
  "hover:ring-1 hover:ring-[color:var(--primary)]/30",
  "data-[active=true]:bg-[color:var(--primary)]/18 data-[active=true]:text-[color:var(--text)]",
  "data-[active=true]:border-[color:var(--primary)]/35",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/45",
  "disabled:cursor-not-allowed disabled:opacity-50"
);

const MAX_RANGE_DAYS = 365;

const presetOptions: Array<{ label: Exclude<Preset, "CUSTOM">; days: number }> = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

function formatTooltip(start: string, end: string) {
  const toDisplay = (value: string) =>
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;

  return `${toDisplay(start)} → ${toDisplay(end)}`;
}

function toDateInputValue(value: string) {
  if (value.length !== 8) return "";
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function fromDateInputValue(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${year}${month}${day}`;
}

function parseUTCDate(value: string) {
  if (value.length !== 8) return null;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  return new Date(Date.UTC(year, month - 1, day));
}

function diffInDays(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
}

type DatePresetsProps = {
  disabled?: boolean;
};

export default function DatePresets({ disabled = false }: DatePresetsProps) {
  const dateStart = useGlobalFilters((state) => state.dateStart);
  const dateEnd = useGlobalFilters((state) => state.dateEnd);
  const activePreset = useGlobalFilters((state) => state.activePreset);
  const setPreset = useGlobalFilters((state) => state.setPreset);
  const setDateRange = useGlobalFilters((state) => state.setDateRange);

  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState(dateStart);
  const [customEnd, setCustomEnd] = useState(dateEnd);
  const [customError, setCustomError] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isCustomOpen) {
      setCustomStart(dateStart);
      setCustomEnd(dateEnd);
      setCustomError(null);
    }
  }, [dateStart, dateEnd, isCustomOpen]);

  useEffect(() => {
    if (activePreset !== "CUSTOM" && isCustomOpen) {
      setIsCustomOpen(false);
    }
  }, [activePreset, isCustomOpen]);

  useEffect(() => {
    const handleOpen = () => {
      if (!disabled) {
        setIsCustomOpen(true);
        setCustomError(null);
      }
    };

    document.addEventListener(CUSTOM_PRESET_EVENT, handleOpen);
    return () => document.removeEventListener(CUSTOM_PRESET_EVENT, handleOpen);
  }, [disabled]);

  useEffect(() => {
    if (!isCustomOpen) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        target &&
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsCustomOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCustomOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isCustomOpen]);

  const customTooltip = useMemo(
    () => formatTooltip(dateStart, dateEnd),
    [dateStart, dateEnd]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presetOptions.map((preset) => {
        const { start, end } = presetRange(preset.days);
        const isActive = activePreset === preset.label;
        return (
          <button
            key={preset.label}
            type="button"
            title={formatTooltip(start, end)}
            data-active={isActive ? "true" : undefined}
            className={chipClass}
            disabled={disabled}
            onClick={() => setPreset(preset.label)}
          >
            {preset.label}
          </button>
        );
      })}

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          title={customTooltip}
          data-active={activePreset === "CUSTOM" ? "true" : undefined}
          className={chipClass}
          disabled={disabled}
          onClick={() => setIsCustomOpen((open) => !open)}
        >
          Custom
        </button>

        {isCustomOpen && (
          <div
            ref={popoverRef}
            className="surface-pill absolute right-0 z-50 mt-2 w-72 rounded-3xl border border-[color:var(--border)]/70 bg-[color:var(--surface)]/95 p-4 text-sm shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
          >
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wide text-[color:var(--muted)]">
                Start date
                <input
                  type="date"
                  value={toDateInputValue(customStart)}
                  onChange={(event) => {
                    setCustomStart(fromDateInputValue(event.target.value));
                    setCustomError(null);
                  }}
                  className="rounded-2xl border border-[color:var(--border)]/60 bg-[color:var(--surface-2)]/80 px-3 py-2 text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/35"
                />
              </label>
              <label className="flex flex-col gap-1 text-[11px] uppercase tracking-wide text-[color:var(--muted)]">
                End date
                <input
                  type="date"
                  value={toDateInputValue(customEnd)}
                  onChange={(event) => {
                    setCustomEnd(fromDateInputValue(event.target.value));
                    setCustomError(null);
                  }}
                  className="rounded-2xl border border-[color:var(--border)]/60 bg-[color:var(--surface-2)]/80 px-3 py-2 text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/35"
                />
              </label>
            </div>

            {customError && (
              <p className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-100">
                {customError}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2 text-[12px] font-medium uppercase tracking-wide">
              <button
                type="button"
                className="rounded-2xl border border-[color:var(--border)]/60 px-3 py-1.5 text-[color:var(--muted)] transition hover:bg-[color:var(--primary-600)]/15 hover:text-[color:var(--text)]"
                onClick={() => setIsCustomOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl bg-[color:var(--primary)]/85 px-3 py-1.5 text-[color:var(--text)] shadow-[0_10px_30px_rgba(224,36,36,0.35)] transition hover:bg-[color:var(--primary)]"
                onClick={() => {
                  if (!customStart || !customEnd) {
                    setCustomError("Select a valid start and end date.");
                    return;
                  }

                  const startDate = parseUTCDate(customStart);
                  const endDate = parseUTCDate(customEnd);

                  if (!startDate || !endDate) {
                    setCustomError("Invalid date range.");
                    return;
                  }

                  const ordered = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
                  const days = diffInDays(ordered[0], ordered[1]);

                  if (days > MAX_RANGE_DAYS) {
                    setCustomError("Ranges are limited to 365 days.");
                    return;
                  }

                  const startValue = utcYYYYMMDD(ordered[0]);
                  const endValue = utcYYYYMMDD(ordered[1]);

                  setDateRange(startValue, endValue, "CUSTOM");
                  setIsCustomOpen(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
