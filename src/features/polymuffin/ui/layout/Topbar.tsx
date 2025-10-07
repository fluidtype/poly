"use client";

import { useMemo } from "react";
import { RefreshCw } from "lucide-react";

import SearchBar from "@/components/SearchBar";
import { CUSTOM_PRESET_EVENT } from "@/components/search/events";
import { Preset, useGlobalFilters } from "@/stores/useGlobalFilters";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PRESETS: Preset[] = ["7D", "30D", "90D"];

type TopbarProps = {
  loading?: boolean;
  onRefresh?: () => void;
  error?: string | null;
  tint?: "gdelt" | "polymarket" | "twitter" | null;
};

export default function Topbar({ loading = false, onRefresh, error = null, tint = null }: TopbarProps) {
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
    <div className="brand-glow light-divider card-surface flex h-16 w-full items-center gap-3 rounded-xl px-4" data-tint={tint ?? undefined}>
      <div className="flex h-full flex-1 items-center gap-6">
        <div className="flex flex-col justify-center gap-1">
          <span className="text-[11px] uppercase tracking-[0.3em] text-white/50">Active range</span>
          <span className="text-sm font-semibold tracking-tight text-white/90">{rangeLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPreset(preset)}
              className={cn(
                "rounded-full border border-white/5 bg-white/5 px-3 py-0 text-xs font-semibold uppercase tracking-[0.14em] text-white/60 shadow-none transition focus-visible:ring-[var(--ring)]",
                activePreset === preset
                  ? "border-[color:var(--primary)]/40 bg-[color:var(--primary)]/15 text-white/90 shadow-[0_0_8px_rgba(255,59,59,0.15)]"
                  : "hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--accent)]/10 hover:text-white/80",
              )}
            >
              {preset}
            </Button>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={triggerCustom}
            className={cn(
              "rounded-full border border-white/5 bg-white/5 px-3 py-0 text-xs font-semibold uppercase tracking-[0.14em] text-white/60 focus-visible:ring-[var(--ring)]",
              activePreset === "CUSTOM"
                ? "border-[color:var(--primary)]/40 bg-[color:var(--primary)]/15 text-white/90 shadow-[0_0_8px_rgba(255,59,59,0.15)]"
                : "hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--accent)]/10 hover:text-white/80",
            )}
          >
            Custom
          </Button>
        </div>
      </div>
      <div className="flex h-full flex-1 items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={onRefresh}
          className="rounded-full border border-white/5 bg-white/5 text-white/60 transition hover:text-white focus-visible:ring-[var(--ring)]"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
        <div className="w-[620px] max-w-full">
          <SearchBar loading={loading} error={error} onRetry={onRefresh} />
        </div>
      </div>
    </div>
  );
}
