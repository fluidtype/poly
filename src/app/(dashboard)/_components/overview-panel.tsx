"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import type { Datasets } from "@/stores/useGlobalFilters";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

import { KpiStat } from "./KpiStat";
import { Panel } from "./panel";

const quickActions = [
  "Add exposure",
  "Roll position",
  "Set alert",
  "Export report",
];

const datasetLabels: Record<keyof Datasets, string> = {
  gdelt: "GDELT",
  poly: "Polymarket",
  twitter: "Twitter",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string) {
  if (/^\d{8}$/u.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    const parsed = new Date(Date.UTC(year, month, day));
    if (!Number.isNaN(parsed.getTime())) {
      return dateFormatter.format(parsed);
    }
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return dateFormatter.format(parsed);
  }

  return value;
}

export function OverviewPanel({ className }: { className?: string }) {
  const keywords = useGlobalFilters((state) => state.keywords);
  const datasets = useGlobalFilters((state) => state.datasets);
  const activePreset = useGlobalFilters((state) => state.activePreset);
  const dateStart = useGlobalFilters((state) => state.dateStart);
  const dateEnd = useGlobalFilters((state) => state.dateEnd);

  const activeDatasets = useMemo(
    () =>
      Object.entries(datasets)
        .filter(([, enabled]) => enabled)
        .map(([key]) => datasetLabels[key as keyof Datasets])
        .filter(Boolean),
    [datasets],
  );

  const datasetUtilisation = Math.round(
    (activeDatasets.length / Object.keys(datasets).length) * 100,
  );

  const kpis = [
    {
      label: "Keywords tracked",
      value: String(keywords.length),
      delta:
        keywords.length > 0
          ? keywords.join(" · ")
          : "Awaiting keywords",
    },
    {
      label: "Datasets active",
      value: String(activeDatasets.length),
      delta:
        activeDatasets.length > 0
          ? activeDatasets.join(" · ")
          : "All datasets disabled",
    },
    {
      label: "Range preset",
      value: activePreset,
      delta: `${formatDate(dateStart)} → ${formatDate(dateEnd)}`,
    },
  ];

  return (
    <Panel
      className={className}
      title="Execution cockpit"
      eyebrow="Active controls"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          Updated <strong className="text-[var(--fg)]">just now</strong>
        </span>
      }
    >
      <div className="flex flex-1 flex-col gap-4 md:gap-5">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action}
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full border border-white/5 px-4 text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-0"
            >
              {action}
            </Button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/70 p-4 md:p-5">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] md:text-sm">
            <span className="font-medium tracking-wide text-white/80">Dataset coverage</span>
            <span>{datasetUtilisation}% active</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--panel)]/80">
            <div
              className="h-full rounded-full bg-[var(--primary)] shadow-[var(--glow)]"
              style={{ width: `${Math.min(100, datasetUtilisation)}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-white/90">
            {activeDatasets.length > 0
              ? `${activeDatasets.join(", ")} monitoring is active`
              : "Reactivate at least one dataset to resume monitoring."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {kpis.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5"
            >
              <KpiStat label={item.label} value={item.value} delta={item.delta} />
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
