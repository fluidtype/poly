"use client";

import { Panel } from "./panel";

const movers = [
  {
    market: "US election consensus",
    change: "+6.2%",
    sentiment: "Bullish accumulation",
    depth: "$2.1M",
  },
  {
    market: "Ethereum merge bets",
    change: "+4.8%",
    sentiment: "Momentum building",
    depth: "$1.4M",
  },
  {
    market: "Macro inflation <3%",
    change: "-1.9%",
    sentiment: "Cooling activity",
    depth: "$980K",
  },
];

export function MomentumPanel({ className }: { className?: string }) {
  return (
    <Panel
      className={className}
      title="Velocity signals"
      eyebrow="Market movers"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          30m refresh
        </span>
      }
    >
      <ul className="max-h-full flex flex-1 flex-col gap-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
        {movers.map((item) => (
          <li
            key={item.market}
            className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <p className="truncate text-base font-semibold text-white/90">
                  {item.market}
                </p>
                <p className="text-sm text-[var(--muted)]">{item.sentiment}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-[var(--bg)]/60 px-2 py-1 text-xs font-medium text-[var(--primary)] md:text-sm">
                {item.change}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)] md:text-sm">
              <span>Depth</span>
              <span className="text-white/90">{item.depth}</span>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
