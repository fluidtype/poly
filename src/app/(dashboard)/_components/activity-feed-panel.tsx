import { Panel } from "./panel";

const feed = [
  {
    title: "New whale entry",
    body: "0x98f…c32 added $420k liquidity to BTC event.",
    timestamp: "2m ago",
  },
  {
    title: "Sentiment reversal",
    body: "Top 10 traders flipped net-long on macro inflation basket.",
    timestamp: "18m ago",
  },
  {
    title: "Volatility alert",
    body: "Variance on 2024 election contracts moved above 30-day average.",
    timestamp: "31m ago",
  },
  {
    title: "Consensus forming",
    body: "AI policy vote contracts show 68% probability after overnight news.",
    timestamp: "57m ago",
  },
];

export function ActivityFeedPanel({ className }: { className?: string }) {
  return (
    <Panel className={className} subtitle="Realtime" title="Stream & Alerts">
      <ul className="flex-1 space-y-3 overflow-y-auto pr-1">
        {feed.map((item) => (
          <li
            key={item.title}
            className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4"
          >
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>{item.timestamp}</span>
              <span className="rounded-full bg-[var(--primary)]/10 px-2 py-1 text-[var(--primary)]">Alert</span>
            </div>
            <h3 className="mt-2 text-sm font-semibold text-[var(--fg)]">{item.title}</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">{item.body}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
