"use client";

import { useMemo } from "react";
import { usePolySearch } from "@/hooks/usePolySearch";
import { useGlobalFilters } from "@/stores/useGlobalFilters";
import type { TooltipProps } from "recharts";

import { ChartLine } from "./ChartLine";
import { Panel } from "./panel";

type LineDatum = {
  label: string;
  volume: number;
  title: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

function PerformanceTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null;
  }

  const datum = payload[0]?.payload as LineDatum | undefined;
  if (!datum) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[var(--panel)]/90 px-4 py-3 text-xs text-[var(--muted)] shadow-[var(--glow)] backdrop-blur">
      <p className="text-[var(--fg)]">{datum.title}</p>
      <p className="mt-1 text-sm text-[var(--primary)]">{currencyFormatter.format(datum.volume)} 24h vol</p>
    </div>
  );
}

export function PortfolioPanel({ className }: { className?: string }) {
  const keywords = useGlobalFilters((state) => state.keywords);
  const datasets = useGlobalFilters((state) => state.datasets);

  const { data, error, isFetching, isPending } = usePolySearch({
    q: keywords.join(" ") || undefined,
    active: true,
    limit: 40,
    sort: "volume24h",
    enabled: datasets.poly,
  });

  const loading = isPending || isFetching;
  const markets = useMemo(() => data?.markets ?? [], [data?.markets]);

  const lineData = useMemo(() => {
    if (!markets.length) {
      return [] as LineDatum[];
    }

    return markets
      .slice(0, 8)
      .map((market, index) => ({
        label: `#${index + 1}`,
        volume: market.volume24h ?? 0,
        title: market.title,
      }))
      .filter((item) => item.volume > 0);
  }, [markets]);

  const priceSorted = useMemo(
    () =>
      markets
        .filter((market) => typeof market.priceYes === "number")
        .sort((a, b) => (b.priceYes ?? 0) - (a.priceYes ?? 0)),
    [markets],
  );

  const topMarket = priceSorted.at(0) ?? markets.at(0);
  const bottomMarket = priceSorted.length > 1 ? priceSorted.at(-1) : markets.at(-1);

  const showDisabled = !datasets.poly;
  const showEmpty = !loading && !error && datasets.poly && markets.length === 0;

  return (
    <Panel
      className={className}
      title="Portfolio velocity"
      eyebrow="Performance"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          {loading ? "Refreshing…" : "24h volume"}
        </span>
      }
    >
      <div className="flex flex-1 flex-col gap-4 md:gap-5">
        {showDisabled ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--panel-2)]/50 p-4 text-center text-sm text-[var(--muted)]">
            Enable the Polymarket dataset to evaluate portfolio performance.
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
            <div className="h-44 w-full overflow-hidden rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5">
              {loading && lineData.length === 0 ? (
                <div className="h-full w-full animate-pulse rounded-xl bg-white/5" />
              ) : (
                <ChartLine
                  data={lineData}
                  xKey="label"
                  yKey="volume"
                  tooltip={<PerformanceTooltip />}
                  yAxisFormatter={(value) => currencyFormatter.format(value)}
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs text-[var(--muted)] md:text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 px-4 py-2 md:px-5">
                <span className="uppercase tracking-[0.18em]">Top</span>
                <span className="text-white/90">
                  {topMarket
                    ? `${topMarket.title} · ${
                        typeof topMarket.priceYes === "number"
                          ? percentFormatter.format(topMarket.priceYes)
                          : currencyFormatter.format(topMarket.volume24h)
                      }`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 px-4 py-2 md:px-5">
                <span className="uppercase tracking-[0.18em]">Worst</span>
                <span className="text-white/90">
                  {bottomMarket
                    ? `${bottomMarket.title} · ${
                        typeof bottomMarket.priceYes === "number"
                          ? percentFormatter.format(bottomMarket.priceYes)
                          : currencyFormatter.format(bottomMarket.volume24h)
                      }`
                    : "—"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}

