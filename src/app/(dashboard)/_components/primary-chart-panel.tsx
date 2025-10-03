"use client";

import type { TooltipProps } from "recharts";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { Panel } from "./panel";

const chartData = [
  { time: "09:00", liquidity: 320, volume: 180 },
  { time: "10:00", liquidity: 356, volume: 190 },
  { time: "11:00", liquidity: 344, volume: 175 },
  { time: "12:00", liquidity: 372, volume: 210 },
  { time: "13:00", liquidity: 401, volume: 230 },
  { time: "14:00", liquidity: 428, volume: 260 },
  { time: "15:00", liquidity: 446, volume: 275 },
  { time: "16:00", liquidity: 432, volume: 268 },
  { time: "17:00", liquidity: 458, volume: 288 },
  { time: "18:00", liquidity: 474, volume: 295 },
  { time: "19:00", liquidity: 489, volume: 310 },
  { time: "20:00", liquidity: 512, volume: 340 },
];

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length || !label) {
    return null;
  }

  const liquidityPoint = payload.find((item) => item.dataKey === "liquidity");
  const volumePoint = payload.find((item) => item.dataKey === "volume");

  return (
    <div className="rounded-2xl border border-white/5 bg-[var(--panel)]/90 px-4 py-3 text-xs text-[var(--muted)] shadow-[var(--glow)] backdrop-blur">
      <p className="text-[var(--fg)]">{label}</p>
      <p className="mt-1 flex items-center justify-between gap-8">
        <span>Liquidity</span>
        <span className="text-[var(--primary)]">{liquidityPoint?.value ?? "-"}M</span>
      </p>
      <p className="mt-1 flex items-center justify-between gap-8">
        <span>Volume</span>
        <span className="text-[var(--tertiary)]">{volumePoint?.value ?? "-"}K</span>
      </p>
    </div>
  );
}

export function PrimaryChartPanel({ className }: { className?: string }) {
  return (
    <Panel
      className={className}
      title="Cross-market liquidity"
      subtitle="Live aggregate"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          Synced 3m ago
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/70 p-4 text-xs text-[var(--muted)]">
          <p className="uppercase tracking-[0.14em]">Net flow</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--fg)]">+$42.8M</p>
          <p className="mt-1 text-[var(--primary)]">+6.4% vs last 24h</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/70 p-4 text-xs text-[var(--muted)]">
          <p className="uppercase tracking-[0.14em]">Funding cost</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--fg)]">3.4%</p>
          <p className="mt-1 text-[var(--muted)]">Weighted across active positions</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/70 p-4 text-xs text-[var(--muted)]">
          <p className="uppercase tracking-[0.14em]">Market depth</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--fg)]">$8.7M</p>
          <p className="mt-1 text-[var(--muted)]">Top 5 order books combined</p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="liquidityGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.85} />
                <stop offset="95%" stopColor="var(--tertiary)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="volumeGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--tertiary)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--panel-2)" strokeOpacity={0.6} strokeDasharray="3 8" />
            <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} dy={10} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              width={48}
              tickFormatter={(value) => `${value}M`}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--primary)", strokeOpacity: 0.15, strokeWidth: 2 }} />
            <Bar dataKey="volume" barSize={18} radius={6} fill="url(#volumeGradient)" />
            <Area
              type="monotone"
              dataKey="liquidity"
              stroke="var(--primary)"
              strokeWidth={2.4}
              fill="url(#liquidityGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "var(--primary)" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
