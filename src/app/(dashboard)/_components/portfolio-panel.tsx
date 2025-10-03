import { Panel } from "./panel";

const allocations = [
  { label: "Crypto", weight: 42, color: "bg-[var(--primary)]/70" },
  { label: "Politics", weight: 28, color: "bg-[var(--tertiary)]/70" },
  { label: "Macro", weight: 19, color: "bg-[var(--panel-2)]" },
  { label: "Sports", weight: 11, color: "bg-[var(--panel-2)]/70" },
];

export function PortfolioPanel({ className }: { className?: string }) {
  return (
    <Panel className={className} subtitle="Exposure" title="Portfolio Mix">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex h-3 overflow-hidden rounded-full border border-white/5 bg-[var(--panel-2)]">
          {allocations.map((item) => (
            <div
              key={item.label}
              className={`${item.color} h-full`}
              style={{ width: `${item.weight}%` }}
            />
          ))}
        </div>
        <ul className="space-y-2 text-xs text-[var(--muted)]">
          {allocations.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full border border-white/10 ${item.color}`} />
                {item.label}
              </span>
              <span className="text-[var(--fg)]">{item.weight}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
