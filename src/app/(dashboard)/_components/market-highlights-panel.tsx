import { Panel } from "./panel";

const highlights = [
  {
    title: "Energy shock risk cooling",
    description: "Inventories rebuild ahead of expectations while spreads tighten.",
    confidence: 78,
  },
  {
    title: "AI policy vote incoming",
    description: "Synthetic media rules moving to floor debate with cross-party backing.",
    confidence: 64,
  },
  {
    title: "US election volatility",
    description: "Outsider tickets attracting record option premium this session.",
    confidence: 71,
  },
];

export function MarketHighlightsPanel({ className }: { className?: string }) {
  return (
    <Panel
      className={className}
      subtitle="Narratives"
      title="Highlights feed"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          Curated hourly
        </span>
      }
    >
      <ul className="flex flex-1 flex-col gap-3">
        {highlights.map((item) => (
          <li
            key={item.title}
            className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--fg)]">{item.title}</h3>
                <p className="mt-2 text-xs text-[var(--muted)]">{item.description}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-[var(--bg)]/60 px-2 py-1 text-xs text-[var(--muted)]">
                {item.confidence}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
