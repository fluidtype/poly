"use client";

import { useEffect, useMemo, useState } from "react";

import { CUSTOM_PRESET_EVENT } from "@/components/search/events";
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Preset,
  presetRange,
  useGlobalFilters,
  utcYYYYMMDD,
} from "@/stores/useGlobalFilters";

const MAX_RANGE_DAYS = 365;

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

function parseUTCDate(value: string): Date {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  return new Date(Date.UTC(year, month - 1, day));
}

function differenceInDays(start: Date, end: Date) {
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

  const { toast } = useToast();

  const [customOpen, setCustomOpen] = useState(false);
  const parsedRange = useMemo<DateRange>(
    () => ({ from: parseUTCDate(dateStart), to: parseUTCDate(dateEnd) }),
    [dateStart, dateEnd]
  );
  const [pendingRange, setPendingRange] = useState<DateRange>(() => parsedRange);

  useEffect(() => {
    if (!customOpen) {
      setPendingRange(parsedRange);
    }
  }, [customOpen, parsedRange]);

  useEffect(() => {
    const handleOpen = () => {
      if (!disabled) {
        setPreset("CUSTOM");
        setCustomOpen(true);
      }
    };

    document.addEventListener(CUSTOM_PRESET_EVENT, handleOpen);
    return () => document.removeEventListener(CUSTOM_PRESET_EVENT, handleOpen);
  }, [disabled, setPreset]);

  const handleApply = (range: Required<DateRange>) => {
    const from = range.from <= range.to ? range.from : range.to;
    const to = range.to >= range.from ? range.to : range.from;
    const days = differenceInDays(from, to);

    if (days > MAX_RANGE_DAYS) {
      toast({
        title: "Range too large",
        description: "Custom ranges are limited to 365 days.",
      });
      return;
    }

    setDateRange(utcYYYYMMDD(from), utcYYYYMMDD(to), "CUSTOM");
    setCustomOpen(false);
  };

  const customTooltip = formatTooltip(dateStart, dateEnd);

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        {presetOptions.map((preset) => {
          const { start, end } = presetRange(preset.days);
          const isActive = activePreset === preset.label;
          const tooltip = formatTooltip(start, end);

          return (
            <Tooltip key={preset.label}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  title={tooltip}
                  data-active={isActive ? "true" : undefined}
                  className={chipClass}
                  disabled={disabled}
                  onClick={() => setPreset(preset.label)}
                >
                  {preset.label}
                </button>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          );
        })}

        <Popover
          open={customOpen}
          onOpenChange={(open) => {
            if (disabled) return;
            setCustomOpen(open);
            if (open) {
              setPreset("CUSTOM");
            }
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={chipClass}
                  data-active={activePreset === "CUSTOM" ? "true" : undefined}
                  disabled={disabled}
                >
                  Custom
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>{customTooltip}</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-[320px] md:w-[540px]">
            <DateRangePicker
              value={pendingRange}
              onChange={(range) => setPendingRange(range ?? {})}
              onCancel={() => setCustomOpen(false)}
              onApply={handleApply}
            />
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
}
