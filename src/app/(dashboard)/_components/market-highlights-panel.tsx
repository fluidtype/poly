import { Panel } from "./panel";

const highlights = [
  {
    title: "Energy shock risk cooling",
    description: "Global supply stabilises as inventories rebuild beyond expectations.",
    confidence: 78,
  },
  {
    title: "AI policy vote incoming",
    description: "EU parliament signals consensus on synthetic media disclosures.",
    confidence: 64,
  },
  {
    title: "US election volatility",
    description: "Betting spreads widen as fundraising surges for outsider tickets.",
    confidence: 71,
  },
];

export function MarketHighlightsPanel({ className }: { className?: string }) {
  return (
    <Panel
      className={className}
      subtitle="Narratives"
      title="Signals & Highlights"
      headerAction={
        <button className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)] hover:text-[var(--fg)]">
          View all
        </button>
      }
    >
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-[var(--panel-2)]/70 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Liquidity</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--fg)]">$5.4M</p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Net liquidity added across tracked Polymarket contracts during the last session.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs text-[var(--muted)]">
            <div className="rounded-xl border border-white/5 bg-[var(--bg)]/60 p-3">
              <p className="text-[var(--fg)]">Top inflow</p>
              <p className="mt-1 text-sm text-[var(--primary)]">$1.1M</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-[var(--bg)]/60 p-3">
              <p className="text-[var(--fg)]">Avg. ticket</p>
              <p className="mt-1 text-sm text-[var(--fg)]">$482</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-[var(--bg)]/60 p-3">
              <p className="text-[var(--fg)]">Spread delta</p>
              <p className="mt-1 text-sm text-[var(--primary)]">+9bps</p>
            </div>
          </div>
        </div>
        <ul className="space-y-3">
          {highlights.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 shadow-inner shadow-black/10"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-semibold text-[var(--fg)]">{item.title}</h3>
                <span className="rounded-full border border-white/10 bg-[var(--bg)]/60 px-2 py-1 text-xs text-[var(--muted)]">
                  {item.confidence}%
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
