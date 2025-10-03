import { Panel } from "./panel";

const feed = [
  {
    title: "Rebalance macro basket",
    body: "Suggested unwind of 12% overweight on inflation <3% complex.",
    timestamp: "2m ago",
    status: "Action",
  },
  {
    title: "Desk alert · Whale entry",
    body: "0x98f…c32 added $420k liquidity to BTC event.",
    timestamp: "18m ago",
    status: "Alert",
  },
  {
    title: "Sentiment reversal",
    body: "Top 10 traders flipped net-long on macro inflation basket.",
    timestamp: "31m ago",
    status: "Insight",
  },
  {
    title: "Consensus forming",
    body: "AI policy vote contracts show 68% probability after overnight news.",
    timestamp: "57m ago",
    status: "Monitor",
  },
];

export function ActivityFeedPanel({ className }: { className?: string }) {
  return (
    <Panel
      className={className}
      title="Activity manager"
      eyebrow="Workflow"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          Auto triage on
        </span>
      }
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        <ul className="flex-1 space-y-3 overflow-y-auto pr-2 [scrollbar-width:thin]">
          {feed.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5"
            >
              <div className="flex items-center justify-between text-xs text-[var(--muted)] md:text-sm">
                <span>{item.timestamp}</span>
                <span className="rounded-full border border-white/10 bg-[var(--bg)]/60 px-2 py-1 text-xs font-medium text-[var(--primary)]">
                  {item.status}
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-[var(--fg)]">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.body}</p>
            </li>
          ))}
        </ul>
        <button className="mt-3 w-full rounded-2xl border border-white/10 bg-[var(--panel-2)]/70 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition hover:text-[var(--fg)] md:text-sm">
          View queue
        </button>
      </div>
    </Panel>
  );
}
