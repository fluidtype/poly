"use client";

import { type ComponentType, useEffect, useState } from "react";

import AdvancedModal from "@/components/gdelt/AdvancedModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CUSTOM_PRESET_EVENT,
  SEARCH_SUBMIT_EVENT,
} from "@/components/search/events";
import type { Datasets, Preset } from "@/stores/useGlobalFilters";
import { twitterDatasetEnabled, useGlobalFilters } from "@/stores/useGlobalFilters";
import {
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Database,
  Layers3,
  Search,
  Settings2,
  Twitter,
} from "lucide-react";

import { ToolbarPills } from "./toolbar-pills";

const presetOptions: { label: string; value: Preset; icon: ComponentType<{ className?: string }> }[] = [
  { label: "7D", value: "7D", icon: CalendarDays },
  { label: "30D", value: "30D", icon: CalendarClock },
  { label: "90D", value: "90D", icon: Layers3 },
  { label: "Custom", value: "CUSTOM", icon: CalendarRange },
];

const datasetOptions: {
  label: string;
  key: keyof Datasets;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { label: "GDELT", key: "gdelt", icon: Database },
  { label: "Polymarket", key: "poly", icon: Settings2 },
  { label: "Twitter", key: "twitter", icon: Twitter },
];

function parseKeywords(value: string) {
  return value
    .split(/[\s,]+/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function Topbar({ className }: { className?: string }) {
  const keywords = useGlobalFilters((state) => state.keywords);
  const setKeywords = useGlobalFilters((state) => state.setKeywords);
  const setPreset = useGlobalFilters((state) => state.setPreset);
  const activePreset = useGlobalFilters((state) => state.activePreset);
  const datasets = useGlobalFilters((state) => state.datasets);
  const toggleDataset = useGlobalFilters((state) => state.toggleDataset);

  const [query, setQuery] = useState(() => keywords.join(" "));
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    const joined = keywords.join(" ");
    setQuery((current) => (current === joined ? current : joined));
  }, [keywords]);

  const dispatchSearchEvent = (parsed: string[]) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(SEARCH_SUBMIT_EVENT, {
          detail: { keywords: parsed },
        })
      );
    }
  };

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const parsed = parseKeywords(query);
    setKeywords(parsed);
    dispatchSearchEvent(parsed);
  };

  const handlePresetClick = (value: Preset) => {
    setPreset(value);

    if (value === "CUSTOM" && typeof document !== "undefined") {
      document.dispatchEvent(new CustomEvent(CUSTOM_PRESET_EVENT));
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex h-auto w-full flex-wrap items-center gap-3 rounded-3xl border border-white/5 bg-[var(--panel)]/90 p-4 text-sm shadow-[var(--glow)] backdrop-blur md:h-16 md:flex-nowrap md:gap-4 md:px-6 md:py-0",
          className
        )}
      >
        <form
          onSubmit={handleSubmit}
          className="flex min-w-[260px] flex-1 items-center gap-3 rounded-2xl border border-white/5 bg-[var(--panel-2)]/80 px-4 py-2.5"
        >
          <Search className="h-4 w-4 text-[var(--muted)]" strokeWidth={2} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search narratives or markets"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--fg)] placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
            type="search"
          />
          <Button
            type="submit"
            size="sm"
            variant="secondary"
            className="rounded-full px-4 text-xs font-semibold text-[var(--fg)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
          >
            Run query
          </Button>
        </form>

        <ToolbarPills
          ariaLabel="Select preset range"
          className="whitespace-nowrap"
          items={presetOptions.map((option) => ({
            id: option.value,
            label: option.label,
            icon: option.icon,
            active: activePreset === option.value,
            onClick: () => handlePresetClick(option.value),
          }))}
        />

        <ToolbarPills
          ariaLabel="Toggle datasets"
          className="whitespace-nowrap"
          items={datasetOptions.map(({ label, key, icon: Icon }) => ({
            id: key,
            label,
            icon: Icon,
            active: datasets[key],
            disabled: key === "twitter" && !twitterDatasetEnabled,
            onClick: () => toggleDataset(key),
            activeClassName:
              "border-white/15 bg-[var(--tertiary)]/20 text-[var(--fg)] shadow-[0_0_0_1px_rgba(122,60,240,0.35)]",
          }))}
        />

        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setAdvancedOpen(true)}
          className="ml-auto rounded-full border border-white/10 px-4 text-xs font-semibold text-[var(--fg)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
        >
          <Settings2 className="mr-1.5 h-4 w-4 text-[var(--muted)]" />
          Advanced
        </Button>
      </div>

      <AdvancedModal open={advancedOpen} onOpenChange={setAdvancedOpen} />
    </>
  );
}
