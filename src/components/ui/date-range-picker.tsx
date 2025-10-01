"use client";

import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Calendar } from "./calendar";

export type DateRange = {
  from?: Date;
  to?: Date;
};

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange | undefined) => void;
  onApply: (range: Required<DateRange>) => void;
  onCancel?: () => void;
}

function formatDate(date?: Date) {
  if (!date) return "--";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function DateRangePicker({
  value,
  onChange,
  onApply,
  onCancel,
}: DateRangePickerProps) {
  const handleApply = () => {
    if (!value.from || !value.to) return;
    onApply({ from: value.from, to: value.to });
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="range"
        numberOfMonths={2}
        selected={value}
        onSelect={onChange}
        defaultMonth={value.from ?? new Date()}
      />

      <div className="flex items-center justify-between rounded-2xl bg-[color:var(--surface-2)]/60 px-4 py-3 text-xs uppercase tracking-wide text-[color:var(--muted)]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 opacity-70" />
          <div className="flex flex-col text-[color:var(--text)] normal-case">
            <span className="text-[11px] uppercase tracking-wider text-[color:var(--muted)]">From</span>
            <span className="text-sm font-semibold text-[color:var(--text)]">{formatDate(value.from)}</span>
          </div>
        </div>
        <span className="px-2 text-[color:var(--muted)]">→</span>
        <div className="flex flex-col text-[color:var(--text)] normal-case">
          <span className="text-[11px] uppercase tracking-wider text-[color:var(--muted)]">To</span>
          <span className="text-sm font-semibold text-[color:var(--text)]">{formatDate(value.to)}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-2xl"
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          className={cn(
            "rounded-2xl px-4",
            (!value.from || !value.to) && "pointer-events-none opacity-40"
          )}
          onClick={handleApply}
          disabled={!value.from || !value.to}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
