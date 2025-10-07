"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GdeltSeriesPoint } from "@/types";

interface GdeltChartProps {
  series: GdeltSeriesPoint[];
  aggregation?: "daily" | "monthly";
  onDateClick?: (iso: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const METRIC_CONFIG = {
  conflict_events: {
    label: "Events",
    color: "#FF3B3B",
    chart: "line" as const,
  },
  avg_sentiment: {
    label: "Sentiment",
    color: "#FF3B3B",
    chart: "area" as const,
  },
  avg_impact: {
    label: "Impact",
    color: "#A347FF",
    chart: "line" as const,
  },
  relative_coverage: {
    label: "Rel Coverage",
    color: "#7A3CF0",
    chart: "line" as const,
  },
};

type MetricKey = keyof typeof METRIC_CONFIG;

const tooltipFormatter = (value?: number | string) => {
  if (value === null || value === undefined || value === "") {
    return "–";
  }
  if (typeof value === "number") {
    if (Math.abs(value) >= 1000) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return value;
};

export function GdeltChart({
  series,
  aggregation = "daily",
  onDateClick,
  isLoading = false,
  error,
}: GdeltChartProps) {
  const [metric, setMetric] = useState<MetricKey>("conflict_events");

  const preparedSeries = useMemo(() => {
    return series.map((point) => ({
      ...point,
      conflict_events: point.conflict_events ?? 0,
      avg_sentiment: point.avg_sentiment ?? 0,
      avg_impact: point.avg_impact ?? 0,
      relative_coverage: point.relative_coverage ?? 0,
    }));
  }, [series]);

  const selectedMetric = METRIC_CONFIG[metric];
  const hasData = preparedSeries.length > 0;

  if (isLoading) {
    return (
      <div className="card-surface card-hover flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl p-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-8 w-40 skeleton" />
          <div className="flex-1 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-surface card-hover flex h-full min-h-[320px] flex-col justify-center gap-2 rounded-2xl border border-[color:var(--primary)]/40 bg-[color:var(--primary)]/10 p-6 text-sm text-[#ff9da8]">
        <p className="font-medium">Unable to load GDELT data</p>
        <p className="text-xs opacity-80">{error}</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="card-surface card-hover flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/60">
        <p>No activity found for the selected filters.</p>
      </div>
    );
  }

  const ChartComponent = selectedMetric.chart === "area" ? AreaChart : LineChart;

  return (
    <div className="card-surface card-hover flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl p-6">
      {aggregation === "monthly" && (
        <span className="pill pointer-events-none self-end bg-[color:var(--primary)]/20 text-white/80">
          Monthly aggregation
        </span>
      )}
      <Tabs
        value={metric}
        onValueChange={(value) => setMetric(value as MetricKey)}
        className="mt-4 flex h-full flex-col"
      >
        <TabsList className="w-max rounded-full bg-white/5 p-1">
          {(Object.entries(METRIC_CONFIG) as [MetricKey, (typeof METRIC_CONFIG)[MetricKey]][]).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="rounded-full px-4 py-1 text-sm uppercase tracking-[0.18em] text-white/50 transition data-[state=active]:bg-[color:var(--primary)] data-[state=active]:text-black"
            >
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={metric} className="mt-6 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent
              data={preparedSeries}
              margin={{ top: 16, right: 24, left: 0, bottom: 16 }}
              onClick={(state) => {
                const payload = state?.activePayload?.[0]?.payload as GdeltSeriesPoint | undefined;
                if (payload?.date && onDateClick) {
                  onDateClick(payload.date);
                }
              }}
            >
              <defs>
                <linearGradient id="pm-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF3B3B" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#7A3CF0" stopOpacity={0.2} />
                </linearGradient>

                <filter id="pm-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} strokeDasharray="3 6" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(value) => tooltipFormatter(value as number) as string}
              />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1 }}
                content={(props) => <CustomTooltip {...props} metricLabel={selectedMetric.label} />}
              />
              <Brush
                dataKey="date"
                height={24}
                stroke="rgba(255,59,59,0.6)"
                travellerWidth={12}
                fill="rgba(255,255,255,0.02)"
              />
              {selectedMetric.chart === "area" ? (
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke="#FF3B3B"
                  fill="url(#pm-grad)"
                  strokeWidth={3}
                  dot={false}
                  filter="url(#pm-glow)"
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke={selectedMetric.color}
                  strokeWidth={3}
                  dot={{ r: 2, strokeWidth: 0, fill: "#FF3B3B" }}
                  activeDot={{ r: 5, strokeWidth: 0, fill: "#FF3B3B", filter: "brightness(1.1)" }}
                  filter="url(#pm-glow)"
                />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CustomTooltip(
  props: TooltipProps<number, string> & { metricLabel: string },
) {
  const { active, payload, label, metricLabel } = props;
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[rgba(18,18,23,0.92)] px-4 py-3 shadow-[0_20px_45px_rgba(0,0,0,0.5)]">
      <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-6 text-sm text-white/80">
        <span className="uppercase tracking-[0.2em] text-white/50">{metricLabel}</span>
        <span className="font-semibold text-white">{tooltipFormatter(payload[0].value)}</span>
      </div>
    </div>
  );
}
