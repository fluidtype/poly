"use client";

import { Panel } from "./panel";

const signals = [
  {
    name: "Funding stress",
    detail: "Futures premium widened to 12bps over cash markets.",
    status: "Watch",
  },
  {
    name: "Narrative drift",
    detail: "Long-tail Twitter cohort diverging from base sentiment.",
    status: "Alert",
  },
  {
    name: "Liquidity pocket",
    detail: "Fresh asks stacking on prediction markets around $0.62.",
    status: "Opportunity",
  },
];

export function SignalsPanel({ className }: { className?: string }) {
  return (
    <Panel
      className={className}
      title="Monitoring grid"
      eyebrow="Signals"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          Sync live
        </span>
      }
    >
      <ul className="max-h-full flex flex-1 flex-col gap-3 overflow-y-auto pr-1 text-sm text-[var(--muted)] [scrollbar-width:thin]">
        {signals.map((signal) => (
          <li
            key={signal.name}
            className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-white/90">{signal.name}</p>
              <span className="rounded-full border border-white/10 bg-[var(--bg)]/60 px-2 py-1 text-xs font-medium text-[var(--primary)] md:text-sm">
                {signal.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">{signal.detail}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
