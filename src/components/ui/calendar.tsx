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
        caption_label: "text-sm font-semibold text-[rgb(var(--text))]",
        nav: "flex items-center gap-1",
        button_previous:
          "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--surface2))]/70 text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))]",
        button_next:
          "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--surface2))]/70 text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))]",
        table: "w-full border-collapse space-y-1",
        head_row: "grid grid-cols-7 text-xs uppercase tracking-wide text-[rgb(var(--muted))]",
        head_cell: "flex h-8 items-center justify-center font-semibold",
        row: "grid grid-cols-7 text-sm",
        cell: cn(
          "relative flex h-9 w-9 items-center justify-center text-sm transition",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full text-[rgb(var(--muted))] transition",
          "hover:bg-[rgb(var(--primary))]/20 hover:text-[rgb(var(--text))]"
        ),
        day_range_start:
          "bg-[rgb(var(--primary))]/80 text-[rgb(var(--text))] hover:bg-[rgb(var(--primary))]/80",
        day_range_end:
          "bg-[rgb(var(--primary))]/80 text-[rgb(var(--text))] hover:bg-[rgb(var(--primary))]/80",
        day_range_middle:
          "rounded-none bg-[rgb(var(--primary))]/30 text-[rgb(var(--text))]",
        day_selected:
          "bg-[rgb(var(--primary))]/80 text-[rgb(var(--text))] hover:bg-[rgb(var(--primary))]/80",
        day_today: "border border-[rgb(var(--primary))]/40",
        ...classNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
