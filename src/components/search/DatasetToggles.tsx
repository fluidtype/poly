"use client";

import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";
import {
  Datasets,
  twitterDatasetEnabled,
  useGlobalFilters,
} from "@/stores/useGlobalFilters";
import { BarChart, Search, Twitter } from "lucide-react";

const chipClass = cn(
  "inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-[13px] transition-all",
  "bg-[rgb(var(--surface2))]/90 border border-[rgb(var(--borderc))]/60",
  "text-[rgb(var(--muted))] hover:bg-[rgb(var(--brand))]/15 hover:text-[rgb(var(--text))]",
  "hover:ring-1 hover:ring-[rgb(var(--brand))]/30",
  "data-[active=true]:bg-[rgb(var(--brand))]/18 data-[active=true]:text-[rgb(var(--text))]",
  "data-[active=true]:border-[rgb(var(--brand))]/35",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand))]/45",
  "disabled:cursor-not-allowed disabled:opacity-50"
);

type DatasetTogglesProps = {
  disabled?: boolean;
};

type DatasetOption = {
  key: keyof Datasets;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const datasetOptions: DatasetOption[] = [
  { key: "gdelt", label: "GDELT", icon: Search },
  { key: "poly", label: "Polymarket", icon: BarChart },
  { key: "twitter", label: "Twitter", icon: Twitter },
];

export default function DatasetToggles({ disabled = false }: DatasetTogglesProps) {
  const datasets = useGlobalFilters((state) => state.datasets);
  const toggleDataset = useGlobalFilters((state) => state.toggleDataset);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {datasetOptions.map(({ key, label, icon: Icon }) => {
        const isTwitter = key === "twitter";
        const isEnabled = !isTwitter || twitterDatasetEnabled;
        const isActive = datasets[key];
        const isDisabled = disabled || !isEnabled;

        return (
          <button
            key={key}
            type="button"
            className={chipClass}
            data-active={isActive ? "true" : undefined}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            onClick={isDisabled ? undefined : () => toggleDataset(key)}
          >
            <Icon className="h-3.5 w-3.5 opacity-75" strokeWidth={2} />
            <span className="font-semibold tracking-tight">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
