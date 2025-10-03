import { Panel } from "./panel";

const trending = [
  { market: "US Election 2024", change: "+6.2%", sentiment: "Bullish" },
  { market: "ETH > $3k", change: "+4.8%", sentiment: "Accumulating" },
  { market: "Inflation < 3%", change: "-1.9%", sentiment: "Cooling" },
  { market: "AI Regulation", change: "+3.4%", sentiment: "Volatile" },
];

export function MomentumPanel({ className }: { className?: string }) {
  return (
    <Panel className={className} subtitle="Momentum shift" title="Trending Markets">
      <ul className="flex-1 space-y-3">
        {trending.map((item) => (
          <li
            key={item.market}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-[var(--panel-2)]/60 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--fg)]">{item.market}</p>
              <p className="text-xs text-[var(--muted)]">{item.sentiment}</p>
            </div>
            <span
              className="rounded-full border border-white/5 bg-[var(--bg)]/60 px-2 py-1 text-xs font-semibold text-[var(--primary)]"
            >
              {item.change}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
