"use client";

import { ChartDonut, type ChartDonutDatum } from "./chart-donut";
import { Panel } from "./panel";

const credit: ChartDonutDatum[] = [
  { name: "Utilised", value: 62, color: "var(--primary)" },
  { name: "Strategic buffer", value: 24, color: "var(--tertiary)" },
  { name: "Available", value: 14, color: "var(--panel-2)" },
];

export function CreditDonutPanel({ className }: { className?: string }) {
  return (
    <Panel
      className={className}
      title="Line of capital"
      eyebrow="Credit"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          Limit $26M
        </span>
      }
    >
      <div className="flex flex-1 flex-col gap-4 md:gap-5">
        <div className="flex-1">
          <ChartDonut data={credit} centerLabel="76%" centerSubLabel="Utilised" />
        </div>
        <ul className="space-y-2 text-xs text-[var(--muted)] md:text-sm">
          {credit.map((item) => (
            <li key={item.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full border border-white/10"
                  style={{ background: item.color }}
                />
                {item.name}
              </span>
              <span className="text-[var(--fg)]">{item.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
