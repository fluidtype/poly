"use client"

import { useMemo, useState } from "react"
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
} from "recharts"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { GdeltSeriesPoint } from "@/types"

interface GdeltChartProps {
  series: GdeltSeriesPoint[]
  aggregation?: "daily" | "monthly"
  onDateClick?: (iso: string) => void
  isLoading?: boolean
  error?: string | null
}

const METRIC_CONFIG = {
  conflict_events: {
    label: "Events",
    color: "#f87171",
    chart: "line" as const,
  },
  avg_sentiment: {
    label: "Sentiment",
    color: "#f43f5e",
    chart: "area" as const,
  },
  avg_impact: {
    label: "Impact",
    color: "#ef4444",
    chart: "line" as const,
  },
  relative_coverage: {
    label: "Rel Coverage",
    color: "#dc2626",
    chart: "line" as const,
  },
}

type MetricKey = keyof typeof METRIC_CONFIG

const tooltipFormatter = (value?: number | string) => {
  if (value === null || value === undefined || value === "") {
    return "–"
  }
  if (typeof value === "number") {
    if (Math.abs(value) >= 1000) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }
  return value
}

export function GdeltChart({
  series,
  aggregation = "daily",
  onDateClick,
  isLoading = false,
  error,
}: GdeltChartProps) {
  const [metric, setMetric] = useState<MetricKey>("conflict_events")

  const preparedSeries = useMemo(() => {
    return series.map((point) => ({
      ...point,
      conflict_events: point.conflict_events ?? 0,
      avg_sentiment: point.avg_sentiment ?? 0,
      avg_impact: point.avg_impact ?? 0,
      relative_coverage: point.relative_coverage ?? 0,
    }))
  }, [series])

  const selectedMetric = METRIC_CONFIG[metric]
  const hasData = preparedSeries.length > 0

  if (isLoading) {
    return (
      <div className="relative h-[380px] overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] p-4">
        {aggregation === "monthly" && (
          <span className="absolute right-4 top-3 rounded-full bg-[var(--primary)]/20 px-2 py-1 text-xs font-medium text-[var(--primary)]">
            Monthly aggregation
          </span>
        )}
        <div className="flex h-full w-full flex-col gap-4">
          <div className="h-8 w-48 animate-pulse rounded-full bg-gradient-to-r from-[var(--surface-2)] to-[var(--surface-3)]" />
          <div className="flex-1 animate-pulse rounded-3xl bg-gradient-to-br from-[var(--surface-2)] via-[var(--surface-3)] to-[var(--surface-2)]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative h-[380px] rounded-3xl border border-red-400/40 bg-red-500/10 p-4 text-red-200">
        <p className="text-sm font-medium">Unable to load GDELT data</p>
        <p className="mt-2 text-xs opacity-80">{error}</p>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="relative flex h-[380px] flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] p-4 text-sm text-muted-foreground">
        <p>No activity found for the selected filters.</p>
      </div>
    )
  }

  const ChartComponent = selectedMetric.chart === "area" ? AreaChart : LineChart

  return (
    <div className="relative h-[380px] rounded-3xl bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] p-4 shadow-lg shadow-black/5">
      {aggregation === "monthly" && (
        <span className="absolute right-4 top-3 rounded-full bg-[var(--primary)]/20 px-2 py-1 text-xs font-medium text-[var(--primary)]">
          Monthly aggregation
        </span>
      )}
      <Tabs
        value={metric}
        onValueChange={(value) => setMetric(value as MetricKey)}
        className="flex h-full flex-col"
      >
        <TabsList className="w-max bg-[var(--surface-2)]/70 backdrop-blur">
          {(Object.entries(METRIC_CONFIG) as [MetricKey, (typeof METRIC_CONFIG)[MetricKey]][]).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="min-w-[96px]">
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
                const payload = state?.activePayload?.[0]?.payload as GdeltSeriesPoint | undefined
                if (payload?.date && onDateClick) {
                  onDateClick(payload.date)
                }
              }}
            >
              <defs>
                <linearGradient id="gdeltSentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedMetric.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={selectedMetric.color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis
                tick={{ fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(value) => tooltipFormatter(value as number) as string}
              />
              <Tooltip
                wrapperClassName="!bg-transparent"
                contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.25)", background: "var(--surface)" }}
                labelStyle={{ fontWeight: 600, color: "var(--foreground)" }}
                formatter={(value) => [tooltipFormatter(value) as string, selectedMetric.label]}
              />
              <Brush dataKey="date" height={24} stroke={selectedMetric.color} travellerWidth={12} />
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
                  dot={{ r: 2, strokeWidth: 1, stroke: selectedMetric.color, fill: "var(--surface)" }}
                  activeDot={{ r: 4 }}
                />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  )
}
