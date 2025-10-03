"use client";

import type { TooltipProps } from "recharts";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

import { Panel } from "./panel";

const performance = [
  { day: "Mon", value: 96 },
  { day: "Tue", value: 98 },
  { day: "Wed", value: 102 },
  { day: "Thu", value: 107 },
  { day: "Fri", value: 111 },
  { day: "Sat", value: 114 },
  { day: "Sun", value: 118 },
];

const chips = [
  { label: "Top", value: "AI policy vote · +12.4%" },
  { label: "Worst", value: "Inflation <3% · -3.1%" },
];

function PerformanceTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length || !label) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[var(--panel)]/90 px-4 py-3 text-xs text-[var(--muted)] shadow-[var(--glow)] backdrop-blur">
      <p className="text-[var(--fg)]">{label}</p>
      <p className="mt-1 text-sm text-[var(--primary)]">{payload[0].value}%</p>
    </div>
  );
}

export function PortfolioPanel({ className }: { className?: string }) {
  return (
    <Panel
      className={className}
      subtitle="Performance"
      title="Portfolio velocity"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          7d change
        </span>
      }
    >
      <div className="flex flex-1 flex-col gap-4">
        <div className="h-40 w-full overflow-hidden rounded-2xl border border-white/5 bg-[var(--panel-2)]/60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performance} margin={{ top: 12, right: 12, left: 12, bottom: 8 }}>
              <CartesianGrid stroke="var(--panel-2)" strokeOpacity={0.5} strokeDasharray="3 8" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} dy={4} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                width={32}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<PerformanceTooltip />} cursor={{ stroke: "var(--tertiary)", strokeOpacity: 0.25, strokeWidth: 2 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--tertiary)"
                strokeWidth={2.4}
                dot={false}
                activeDot={{ r: 4, fill: "var(--primary)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 gap-2 text-xs text-[var(--muted)]">
          {chips.map((chip) => (
            <div
              key={chip.label}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 px-4 py-2"
            >
              <span className="uppercase tracking-[0.18em]">{chip.label}</span>
              <span className="text-[var(--fg)]">{chip.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
