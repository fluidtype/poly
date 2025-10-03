import { Panel } from "./panel";

const metrics = [
  { label: "Total Volume", value: "$18.4M", delta: "+12.6%" },
  { label: "Active Markets", value: "312", delta: "+8.1%" },
  { label: "Avg. Sentiment", value: "62", delta: "+4" },
];

export function OverviewPanel({ className }: { className?: string }) {
  return (
    <Panel
      className={className}
      subtitle="Last 24 hours"
      title="Market Pulse"
      headerAction={<span className="rounded-full bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">Auto</span>}
    >
      <ul className="grid flex-1 grid-cols-1 gap-3">
        {metrics.map((metric) => (
          <li
            key={metric.label}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-[var(--panel-2)]/70 px-4 py-3"
          >
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                {metric.label}
              </p>
              <p className="text-lg font-semibold text-[var(--fg)]">{metric.value}</p>
            </div>
            <span className="rounded-full border border-white/5 bg-[var(--bg)]/60 px-2 py-1 text-xs font-medium text-[var(--primary)]">
              {metric.delta}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
