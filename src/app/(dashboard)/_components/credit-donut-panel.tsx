"use client";

import { useMemo } from "react";

import { usePolySearch } from "@/hooks/usePolySearch";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

import { ChartDonut } from "./ChartDonut";
import { Panel } from "./panel";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const segmentPalette = [
  "var(--primary)",
  "var(--tertiary)",
  "rgba(184,193,204,0.35)",
  "rgba(122,60,240,0.25)",
];

export function CreditDonutPanel({ className }: { className?: string }) {
  const keywords = useGlobalFilters((state) => state.keywords);
  const datasets = useGlobalFilters((state) => state.datasets);

  const { data, error, isFetching, isPending } = usePolySearch({
    q: keywords.join(" ") || undefined,
    active: true,
    limit: 60,
    sort: "liquidity",
    enabled: datasets.poly,
  });

  const loading = isPending || isFetching;
  const markets = useMemo(() => data?.markets ?? [], [data?.markets]);

  const { segments, totalLiquidity } = useMemo(() => {
    if (!markets.length) {
      return { segments: [], totalLiquidity: 0 } as const;
    }

    const grouped = new Map<string, number>();
    for (const market of markets) {
      const key = market.category && market.category.trim().length > 0 ? market.category : "Uncategorised";
      grouped.set(key, (grouped.get(key) ?? 0) + (market.liquidity ?? 0));
    }

    const totals = Array.from(grouped.entries()).sort((a, b) => b[1] - a[1]);
    const aggregate = totals.reduce((sum, [, value]) => sum + value, 0);

    if (aggregate <= 0) {
      return { segments: [], totalLiquidity: 0 } as const;
    }

    const topSegments = totals.slice(0, 3).map(([name, value], index) => ({
      name,
      rawValue: value,
      value: (value / aggregate) * 100,
      color: segmentPalette[index % segmentPalette.length],
    }));

    const remainder = aggregate - topSegments.reduce((sum, item) => sum + item.rawValue, 0);
    if (remainder > 0) {
      topSegments.push({
        name: "Other",
        rawValue: remainder,
        value: (remainder / aggregate) * 100,
        color: segmentPalette[topSegments.length % segmentPalette.length],
      });
    }

    return { segments: topSegments, totalLiquidity: aggregate } as const;
  }, [markets]);

  const showDisabled = !datasets.poly;
  const showEmpty = !loading && !error && markets.length === 0 && datasets.poly;

  const leadingShare = segments.at(0)?.value ?? 0;
  const leadingLabel = segments.at(0)?.name ?? "No leader";

  return (
    <Panel
      className={className}
      title="Line of capital"
      eyebrow="Credit"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          {loading ? "Reconciling…" : `${currencyFormatter.format(totalLiquidity)} tracked`}
        </span>
      }
    >
      <div className="flex flex-1 flex-col gap-4 md:gap-5">
        {showDisabled ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--panel-2)]/50 p-4 text-center text-sm text-[var(--muted)]">
            Enable the Polymarket dataset to calculate capital distribution.
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
            {(error as Error).message}
          </div>
        ) : showEmpty ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--panel-2)]/50 p-4 text-center text-sm text-[var(--muted)]">
            No data for selected filters.
          </div>
        ) : (
          <>
            <div className="flex-1">
              {loading && segments.length === 0 ? (
                <div className="h-full w-full animate-pulse rounded-xl bg-white/5" />
              ) : (
                <ChartDonut
                  data={segments.map((segment) => ({
                    name: segment.name,
                    value: Number.isFinite(segment.value) ? segment.value : 0,
                    color: segment.color,
                  }))}
                  centerLabel={`${percentFormatter.format(leadingShare)}%`}
                  centerSubLabel={leadingLabel}
                />
              )}
            </div>
            <ul className="space-y-2 text-xs text-[var(--muted)] md:text-sm">
              {(loading && segments.length === 0
                ? Array.from({ length: 4 }).map((_, index) => ({
                    name: `segment-${index}`,
                    value: 0,
                    rawValue: 0,
                    color: segmentPalette[index % segmentPalette.length],
                  }))
                : segments
              ).map((segment) => (
                <li key={segment.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-white/10"
                      style={{ background: segment.color }}
                    />
                    {segment.name}
                  </span>
                  <span className="text-[var(--fg)]">
                    {loading && segments.length === 0
                      ? "—"
                      : `${percentFormatter.format(segment.value)}% · ${currencyFormatter.format(segment.rawValue)}`}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Panel>
  );
}

