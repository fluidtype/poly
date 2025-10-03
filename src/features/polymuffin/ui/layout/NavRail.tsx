"use client";

import { useMemo } from "react";
import { Activity, BarChart2, Twitter } from "lucide-react";

import { useGlobalFilters } from "@/stores/useGlobalFilters";
import { cn } from "@/lib/utils";

const DATASET_ICONS: Record<"gdelt" | "poly" | "twitter", React.ComponentType<{ className?: string }>> = {
  gdelt: Activity,
  poly: BarChart2,
  twitter: Twitter,
};

const DATASET_LABELS: Record<"gdelt" | "poly" | "twitter", string> = {
  gdelt: "GDELT",
  poly: "Polymarket",
  twitter: "Twitter",
};

export default function NavRail() {
  const datasets = useGlobalFilters((state) => state.datasets);
  const toggleDataset = useGlobalFilters((state) => state.toggleDataset);

  const buttons = useMemo(
    () =>
      (Object.keys(datasets) as Array<keyof typeof datasets>).map((key) => ({
        id: key,
        enabled: datasets[key],
        label: DATASET_LABELS[key],
        Icon: DATASET_ICONS[key],
      })),
    [datasets],
  );

  return (
    <nav className="card flex h-full flex-col items-center justify-between gap-4 px-3 py-6">
      <div className="flex flex-col items-center gap-4">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">Poly</div>
        <div className="h-px w-8 bg-[color:var(--border)]" />
        <div className="flex flex-col items-center gap-3">
          {buttons.map(({ id, label, Icon, enabled }) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleDataset(id)}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl border text-[color:var(--muted)] transition",
                enabled
                  ? "border-[color:var(--accent)]/60 bg-[color:var(--accent)]/15 text-[color:var(--fg)]"
                  : "border-[color:var(--border)]/70 bg-transparent hover:border-[color:var(--accent)]/40 hover:text-[color:var(--fg)]",
              )}
              aria-pressed={enabled}
              aria-label={label}
              title={label}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>
      <div className="text-center text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted)]">
        Toggle datasets
      </div>
    </nav>
  );
}
