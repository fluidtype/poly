"use client";

import { Button } from "@/components/ui/button";

import { KpiStat } from "./kpi-stat";
import { Panel } from "./panel";

const quickActions = [
  "Add exposure",
  "Roll position",
  "Set alert",
  "Export report",
];

const kpis = [
  { label: "Signals armed", value: "12" },
  { label: "Tasks due", value: "3" },
  { label: "Capital deployed", value: "$12.6M" },
];

export function OverviewPanel({ className }: { className?: string }) {
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
              className="rounded-full border border-white/5 px-4 text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
            >
              {action}
            </Button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/70 p-4 md:p-5">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] md:text-sm">
            <span className="font-medium tracking-wide text-white/80">Line utilisation</span>
            <span>72% allocated</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--panel)]/80">
            <div className="h-full rounded-full bg-[var(--primary)] shadow-[var(--glow)]" style={{ width: "72%" }} />
          </div>
          <p className="mt-4 text-sm text-white/90">
            $18.9M credit line active · $7.2M available headroom
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {kpis.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5"
            >
              <KpiStat label={item.label} value={item.value} />
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
