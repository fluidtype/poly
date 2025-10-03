"use client";

import { useMemo } from "react";
import { RefreshCw } from "lucide-react";

import SearchBar from "@/components/SearchBar";
import { CUSTOM_PRESET_EVENT } from "@/components/search/events";
import { Preset, useGlobalFilters } from "@/stores/useGlobalFilters";
import { cn } from "@/lib/utils";

const PRESETS: Preset[] = ["7D", "30D", "90D"];

type TopbarProps = {
  loading?: boolean;
  onRefresh?: () => void;
  error?: string | null;
};

export default function Topbar({ loading = false, onRefresh, error = null }: TopbarProps) {
  const activePreset = useGlobalFilters((state) => state.activePreset);
  const setPreset = useGlobalFilters((state) => state.setPreset);
  const dateStart = useGlobalFilters((state) => state.dateStart);
  const dateEnd = useGlobalFilters((state) => state.dateEnd);

  const rangeLabel = useMemo(() => {
    const pretty = (value: string) => {
      if (value.length !== 8) {
        return value;
      }
      return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
    };
    return `${pretty(dateStart)} → ${pretty(dateEnd)}`;
  }, [dateStart, dateEnd]);

  const triggerCustom = () => {
    setPreset("CUSTOM");
    document.dispatchEvent(new CustomEvent(CUSTOM_PRESET_EVENT));
  };

  return (
    <div className="card flex h-full items-center gap-6 px-6 py-4">
      <div className="flex flex-1 items-center gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted)]">Active range</span>
          <span className="text-sm font-semibold text-[color:var(--fg)]">{rangeLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setPreset(preset)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                activePreset === preset
                  ? "border-[color:var(--accent)]/60 bg-[color:var(--accent)]/20 text-[color:var(--fg)]"
                  : "border-[color:var(--border)]/70 text-[color:var(--muted)] hover:border-[color:var(--accent)]/40 hover:text-[color:var(--fg)]",
              )}
            >
              {preset}
            </button>
          ))}
          <button
            type="button"
            onClick={triggerCustom}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold text-[color:var(--muted)] transition",
              activePreset === "CUSTOM"
                ? "border-[color:var(--accent)]/60 bg-[color:var(--accent)]/20 text-[color:var(--fg)]"
                : "border-[color:var(--border)]/70 hover:border-[color:var(--accent)]/40 hover:text-[color:var(--fg)]",
            )}
          >
            Custom
          </button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-3">
        <button
          type="button"
          onClick={onRefresh}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)]/70 text-[color:var(--muted)] transition hover:border-[color:var(--accent)]/50 hover:text-[color:var(--fg)]"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
        <div className="w-[620px] max-w-full">
          <SearchBar loading={loading} error={error} onRetry={onRefresh} />
        </div>
      </div>
    </div>
  );
}
