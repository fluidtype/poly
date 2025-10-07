"use client";

import { useMemo } from "react";

import { useGlobalFilters } from "@/stores/useGlobalFilters";

function formatDate(value: string) {
  if (value.length !== 8) {
    return value;
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

export function ActiveRangeLabel() {
  const dateStart = useGlobalFilters((state) => state.dateStart);
  const dateEnd = useGlobalFilters((state) => state.dateEnd);

  const rangeLabel = useMemo(() => {
    return `${formatDate(dateStart)} → ${formatDate(dateEnd)}`;
  }, [dateStart, dateEnd]);

  return (
    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-[rgb(var(--muted))]">
      <span>ACTIVE RANGE</span>
      <span className="text-sm font-semibold tracking-normal text-[rgb(var(--text))]">
        {rangeLabel}
      </span>
    </div>
  );
}
