import { Button } from "@/components/ui/button";

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
      subtitle="Active controls"
      title="Execution cockpit"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          Updated <strong className="text-[var(--fg)]">just now</strong>
        </span>
      }
    >
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action}
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full border border-white/5 px-4 text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
            >
              {action}
            </Button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/70 p-5">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="uppercase tracking-[0.18em]">Line utilisation</span>
            <span>72% allocated</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--panel)]/80">
            <div className="h-full rounded-full bg-[var(--primary)] shadow-[var(--glow)]" style={{ width: "72%" }} />
          </div>
          <p className="mt-3 text-sm text-[var(--fg)]">
            $18.9M credit line active · $7.2M available headroom
          </p>
        </div>

        <ul className="grid grid-cols-3 gap-3 text-xs text-[var(--muted)]">
          {kpis.map((item) => (
            <li
              key={item.label}
              className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4"
            >
              <p className="uppercase tracking-[0.16em]">{item.label}</p>
              <p
                className="mt-2 text-lg font-semibold text-[var(--fg)]"
              >
                {item.value}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
