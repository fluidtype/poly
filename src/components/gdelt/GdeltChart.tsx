"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Brush,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
    color: "#FF6B6B",
    chart: "line" as const,
  },
  avg_sentiment: {
    label: "Sentiment",
    color: "#E53935",
    chart: "area" as const,
  },
  avg_impact: {
    label: "Impact",
    color: "#FF6B6B",
    chart: "line" as const,
  },
  relative_coverage: {
    label: "Rel Coverage",
    color: "#7C4DFF",
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
      <div className="card-elev flex h-full min-h-[320px] flex-col overflow-hidden p-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-8 w-40 animate-pulse rounded-full bg-[rgb(var(--surface3))]/70" />
          <div className="flex-1 animate-pulse rounded-2xl bg-[rgb(var(--surface3))]/60" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card flex h-full min-h-[320px] flex-col justify-center gap-2 rounded-2xl border border-[rgb(var(--brand))]/40 bg-[rgb(var(--brand))]/10 p-6 text-sm text-[rgb(var(--accent-light))]">
        <p className="font-medium">Unable to load GDELT data</p>
        <p className="text-xs opacity-80">{error}</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="card flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--borderc))]/70 bg-[rgb(var(--surface2))]/70 p-6 text-sm text-[rgb(var(--muted))]">
        <p>No activity found for the selected filters.</p>
      </div>
    );
  }

  const ChartComponent = selectedMetric.chart === "area" ? AreaChart : LineChart;

  return (
    <div className="card-elev flex h-full min-h-[320px] flex-col overflow-hidden p-6">
      {aggregation === "monthly" && (
        <span className="pill pointer-events-none self-end bg-[rgb(var(--brand))]/15 text-[rgb(var(--accent-light))]">
          Monthly aggregation
        </span>
      )}
      <Tabs
        value={metric}
        onValueChange={(value) => setMetric(value as MetricKey)}
        className="mt-4 flex h-full flex-col"
      >
        <TabsList className="w-max rounded-full bg-[rgb(var(--surface))]/80 p-1">
          {(Object.entries(METRIC_CONFIG) as [MetricKey, (typeof METRIC_CONFIG)[MetricKey]][]).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="rounded-full px-4 py-1 text-sm data-[state=active]:bg-[rgb(var(--brand))] data-[state=active]:text-black"
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
                <linearGradient id="gdeltSentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedMetric.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={selectedMetric.color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "var(--muted)", fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(value) => tooltipFormatter(value as number) as string}
              />
              <Tooltip
                wrapperClassName="!bg-transparent"
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.05)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
                  background: "var(--panel)",
                }}
                labelStyle={{ fontWeight: 600, color: "rgb(var(--text))" }}
                formatter={(value) => [tooltipFormatter(value) as string, selectedMetric.label]}
              />
              <Brush
                dataKey="date"
                height={24}
                stroke={selectedMetric.color}
                travellerWidth={12}
                fill="rgba(255,255,255,0.02)"
              />
              {selectedMetric.chart === "area" ? (
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={selectedMetric.color}
                  fill="url(#gdeltSentimentGradient)"
                  strokeWidth={3}
                  dot={false}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke={selectedMetric.color}
                  strokeWidth={3}
                  dot={{ r: 2, strokeWidth: 1, stroke: selectedMetric.color, fill: "var(--card)" }}
                  activeDot={{ r: 4 }}
                />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}
