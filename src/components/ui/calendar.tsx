"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("space-y-4", className)}
      classNames={{
        months: "grid grid-cols-1 md:grid-cols-2 gap-4",
        month: "space-y-4",
        month_caption: "flex items-center justify-between px-4",
        caption_label: "text-sm font-semibold text-[color:var(--text)]",
        nav: "flex items-center gap-1",
        button_previous:
          "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--surface-2)]/70 text-[color:var(--muted)] transition hover:text-[color:var(--text)]",
        button_next:
          "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--surface-2)]/70 text-[color:var(--muted)] transition hover:text-[color:var(--text)]",
        table: "w-full border-collapse space-y-1",
        head_row: "grid grid-cols-7 text-xs uppercase tracking-wide text-[color:var(--muted)]",
        head_cell: "flex h-8 items-center justify-center font-semibold",
        row: "grid grid-cols-7 text-sm",
        cell: cn(
          "relative flex h-9 w-9 items-center justify-center text-sm transition",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--muted)] transition",
          "hover:bg-[color:var(--primary)]/20 hover:text-[color:var(--text)]"
        ),
        day_range_start:
          "bg-[color:var(--primary)]/80 text-[color:var(--text)] hover:bg-[color:var(--primary)]/80",
        day_range_end:
          "bg-[color:var(--primary)]/80 text-[color:var(--text)] hover:bg-[color:var(--primary)]/80",
        day_range_middle:
          "rounded-none bg-[color:var(--primary)]/30 text-[color:var(--text)]",
        day_selected:
          "bg-[color:var(--primary)]/80 text-[color:var(--text)] hover:bg-[color:var(--primary)]/80",
        day_today: "border border-[color:var(--primary)]/40",
        ...classNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
