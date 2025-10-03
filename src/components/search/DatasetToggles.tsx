"use client";

import type { ComponentType, SVGProps } from "react";

import { pill } from "@/components/search/pill";
import { cn } from "@/lib/utils";
import {
  Datasets,
  twitterDatasetEnabled,
  useGlobalFilters,
} from "@/stores/useGlobalFilters";
import { BarChart, Search, Twitter } from "lucide-react";

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
  { key: "polymuffin", label: "Polymarket", icon: BarChart },
  { key: "twitter", label: "Twitter", icon: Twitter },
];

export function DatasetToggles({ disabled = false }: DatasetTogglesProps) {
  const datasets = useGlobalFilters((state) => state.datasets);
  const toggleDataset = useGlobalFilters((state) => state.toggleDataset);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {datasetOptions.map(({ key, label, icon: Icon }) => {
        const isTwitter = key === "twitter";
        const isEnabled = !isTwitter || twitterDatasetEnabled;
        const isActive = datasets[key];
        const isDisabled = disabled || !isEnabled;

        const buttonClass = cn(
          pill,
          "inline-flex items-center gap-1.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand))]/35",
          isDisabled && "cursor-not-allowed opacity-50"
        );

        const buttonProps = isDisabled
          ? { onClick: undefined as undefined }
          : { onClick: () => toggleDataset(key) };

        return (
          <button
            key={key}
            type="button"
            className={buttonClass}
            data-active={isActive ? "true" : undefined}
            aria-disabled={isDisabled}
            disabled={isDisabled}
            {...buttonProps}
          >
            <Icon className="h-3.5 w-3.5 opacity-75" strokeWidth={2} />
            <span className="font-semibold tracking-tight">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
