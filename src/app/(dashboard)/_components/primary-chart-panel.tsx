"use client";

import type { TooltipProps } from "recharts";

import { ChartArea } from "./chart-area";
import { KpiStat } from "./kpi-stat";
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

const highlights = [
  {
    label: "Net flow",
    value: "+$42.8M",
    delta: "+6.4% vs last 24h",
    tone: "positive" as const,
  },
  {
    label: "Funding cost",
    value: "3.4%",
    delta: "Weighted across active positions",
    tone: "neutral" as const,
  },
  {
    label: "Market depth",
    value: "$8.7M",
    delta: "Top 5 order books combined",
    tone: "neutral" as const,
  },
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
      eyebrow="Live aggregate"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          Synced 3m ago
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {highlights.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/70 p-4 md:p-5"
          >
            <KpiStat
              label={item.label}
              value={item.value}
              delta={item.delta}
              deltaTone={item.tone}
            />
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-hidden rounded-2xl border border-white/5 bg-[var(--panel-2)]/70 p-4 md:p-5">
        <ChartArea
          data={chartData}
          xKey="time"
          areaKey="liquidity"
          barKey="volume"
          tooltip={<ChartTooltip />}
          yAxisFormatter={(value) => `${value}M`}
        />
      </div>
    </Panel>
  );
}
