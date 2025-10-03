"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TooltipProps } from "recharts";

import { fetchGdeltContextData } from "@/hooks/useGdeltContext";
import { commonQueryOptions } from "@/hooks/utils";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

import { ChartArea } from "./ChartArea";
import { KpiStat } from "./KpiStat";
import { Panel } from "./panel";

type ChartPoint = {
  label: string;
  events: number;
  coverage: number;
  rawDate: string;
};

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const toneFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function formatDateLabel(value: string) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    if (/^\d{8}$/u.test(value)) {
      const year = Number(value.slice(0, 4));
      const month = Number(value.slice(4, 6)) - 1;
      const day = Number(value.slice(6, 8));
      const fallback = new Date(Date.UTC(year, month, day));
      if (!Number.isNaN(fallback.getTime())) {
        return dayFormatter.format(fallback);
      }
    }

    return value;
  }

  return dayFormatter.format(parsed);
}

function buildChartData(series: ChartPoint[]): ChartPoint[] {
  return series.filter((point) => point.label.length > 0);
}

function extractChartSeries(data?: Awaited<ReturnType<typeof fetchGdeltContextData>>): ChartPoint[] {
  if (!data?.series?.length) {
    return [];
  }

  return buildChartData(
    data.series.map((point) => {
      const events = typeof point.conflict_events === "number" ? Math.max(point.conflict_events, 0) : 0;
      const coverageSource =
        typeof point.relative_coverage === "number"
          ? point.relative_coverage
          : typeof point.interaction_count === "number"
            ? point.interaction_count
            : 0;

      return {
        label: formatDateLabel(point.date ?? ""),
        events,
        coverage: Math.max(coverageSource, 0),
        rawDate: point.date ?? "",
      } satisfies ChartPoint;
    }),
  );
}

function buildHighlights(
  data: Awaited<ReturnType<typeof fetchGdeltContextData>> | undefined,
  chartData: ChartPoint[],
  keywordCount: number,
) {
  if (!data) {
    return [] as const;
  }

  const totalEvents =
    typeof data.insights?.total_events === "number"
      ? data.insights.total_events
      : chartData.reduce((sum, point) => sum + point.events, 0);

  const averageTone = data.insights?.sentiment_analysis?.avg_tone;

  const topKeywordEntry = Object.entries(data.insights?.keyword_matches ?? {})
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .at(0);

  const highlights = [
    {
      label: "Total events",
      value: totalEvents > 0 ? compactNumber.format(totalEvents) : "—",
      delta:
        keywordCount > 0
          ? `Across ${keywordCount} keyword${keywordCount === 1 ? "" : "s"}`
          : undefined,
      deltaTone: "neutral" as const,
    },
    {
      label: "Avg tone",
      value:
        typeof averageTone === "number" && Number.isFinite(averageTone)
          ? toneFormatter.format(averageTone)
          : "—",
      delta:
        typeof averageTone === "number"
          ? averageTone >= 0
            ? "Positive sentiment"
            : "Negative sentiment"
          : undefined,
      deltaTone:
        typeof averageTone === "number"
          ? averageTone >= 0
            ? ("positive" as const)
            : ("negative" as const)
          : ("neutral" as const),
    },
    {
      label: "Top keyword",
      value: topKeywordEntry?.[0] ?? "—",
      delta:
        typeof topKeywordEntry?.[1] === "number"
          ? `${compactNumber.format(topKeywordEntry[1])} mentions`
          : undefined,
      deltaTone: "neutral" as const,
    },
  ];

  return highlights;
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null;
  }

  const label = payload[0]?.payload?.rawDate ?? payload[0]?.payload?.label;
  const events = payload.find((item) => item.dataKey === "events")?.value;
  const coverage = payload.find((item) => item.dataKey === "coverage")?.value;

  return (
    <div className="rounded-2xl border border-white/5 bg-[var(--panel)]/90 px-4 py-3 text-xs text-[var(--muted)] shadow-[var(--glow)] backdrop-blur">
      <p className="text-[var(--fg)]">{label}</p>
      <p className="mt-1 flex items-center justify-between gap-6">
        <span>Events</span>
        <span className="text-[var(--primary)]">{events ? compactNumber.format(Number(events)) : "—"}</span>
      </p>
      <p className="mt-1 flex items-center justify-between gap-6">
        <span>Coverage</span>
        <span className="text-[var(--tertiary)]">{coverage ? compactNumber.format(Number(coverage)) : "—"}</span>
      </p>
    </div>
  );
}

export function PrimaryChartPanel({ className }: { className?: string }) {
  const keywords = useGlobalFilters((state) => state.keywords);
  const dateStart = useGlobalFilters((state) => state.dateStart);
  const dateEnd = useGlobalFilters((state) => state.dateEnd);
  const datasets = useGlobalFilters((state) => state.datasets);

  const queryEnabled =
    datasets.gdelt && keywords.length > 0 && Boolean(dateStart) && Boolean(dateEnd);

  const queryKey = useMemo(
    () => ({
      keywords: keywords.join("|"),
      dateStart,
      dateEnd,
    }),
    [dateEnd, dateStart, keywords],
  );

  const { data, error, isFetching, isPending } = useQuery({
    queryKey: ["dashboard", "gdelt", "context", queryKey],
    queryFn: ({ signal }) =>
      fetchGdeltContextData(
        {
          dateStart,
          dateEnd,
          keywords,
          limit: 400,
          includeInsights: true,
        },
        fetch,
        signal,
      ),
    enabled: queryEnabled,
    ...commonQueryOptions,
  });

  const loading = isPending || isFetching;
  const chartData = useMemo(() => extractChartSeries(data), [data]);
  const highlights = useMemo(
    () => buildHighlights(data, chartData, keywords.length),
    [chartData, data, keywords.length],
  );

  const showNoKeywords = datasets.gdelt && keywords.length === 0;
  const showDisabled = !datasets.gdelt;
  const showEmpty = !loading && !error && chartData.length === 0 && queryEnabled;

  return (
    <Panel
      className={className}
      title="Cross-market liquidity"
      eyebrow="Live aggregate"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          {loading ? "Syncing…" : "Synced"}
        </span>
      }
    >
      {showDisabled ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--panel-2)]/50 text-center text-sm text-[var(--muted)]">
          Enable the GDELT dataset to visualise liquidity coverage.
        </div>
      ) : showNoKeywords ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--panel-2)]/50 text-center text-sm text-[var(--muted)]">
          Add at least one keyword in the search bar to fetch contextual liquidity data.
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
          {(error as Error).message}
        </div>
      ) : showEmpty ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--panel-2)]/50 text-center text-sm text-[var(--muted)]">
          No data for selected filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {loading && highlights.length === 0
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/70 p-4 md:p-5"
                  >
                    <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
                    <div className="mt-3 h-6 w-32 animate-pulse rounded-full bg-white/10" />
                    <div className="mt-2 h-4 w-20 animate-pulse rounded-full bg-white/5" />
                  </div>
                ))
              : highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/70 p-4 md:p-5"
                  >
                    <KpiStat
                      label={item.label}
                      value={item.value}
                      delta={item.delta}
                      deltaTone={item.deltaTone}
                    />
                  </div>
                ))}
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl border border-white/5 bg-[var(--panel-2)]/70 p-4 md:p-5">
            {loading && chartData.length === 0 ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-white/5" />
            ) : (
              <ChartArea
                data={chartData}
                xKey="label"
                areaKey="events"
                barKey="coverage"
                tooltip={<ChartTooltip />}
                yAxisFormatter={(value) => compactNumber.format(value)}
              />
            )}
          </div>
        </>
      )}
    </Panel>
  );
}

