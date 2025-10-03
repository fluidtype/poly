"use client";

import { useMemo } from "react";

import { usePolySearch } from "@/hooks/usePolySearch";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

import { Panel } from "./panel";

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function classifySentiment(price?: number) {
  if (typeof price !== "number" || Number.isNaN(price)) {
    return "Neutral order flow";
  }

  if (price >= 0.6) {
    return "Bullish accumulation";
  }

  if (price <= 0.4) {
    return "Bearish pressure";
  }

  return "Range-bound";
}

function formatChange(price?: number) {
  if (typeof price !== "number" || Number.isNaN(price)) {
    return "—";
  }

  const delta = price - 0.5;
  const formatted = percentFormatter.format(Math.abs(delta));
  return `${delta >= 0 ? "+" : "-"}${formatted}`;
}

export function MomentumPanel({ className }: { className?: string }) {
  const keywords = useGlobalFilters((state) => state.keywords);
  const datasets = useGlobalFilters((state) => state.datasets);

  const { data, error, isFetching, isPending } = usePolySearch({
    q: keywords.join(" ") || undefined,
    active: true,
    limit: 30,
    sort: "volume24h",
    enabled: datasets.poly,
  });

  const loading = isPending || isFetching;
  const markets = useMemo(() => data?.markets ?? [], [data?.markets]);

  const movers = useMemo(() => {
    if (!markets.length) {
      return [];
    }

    return markets.slice(0, 6).map((market) => ({
      id: market.id,
      title: market.title,
      priceYes: market.priceYes,
      liquidity: market.liquidity,
    }));
  }, [markets]);

  const showDisabled = !datasets.poly;
  const showEmpty = !loading && !error && datasets.poly && movers.length === 0;

  return (
    <Panel
      className={className}
      title="Velocity signals"
      eyebrow="Market movers"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          {loading ? "Updating…" : "30m refresh"}
        </span>
      }
    >
      {showDisabled ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--panel-2)]/50 p-4 text-center text-sm text-[var(--muted)]">
          Enable the Polymarket dataset to review velocity signals.
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
        <ul className="max-h-full flex flex-1 flex-col gap-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
          {loading && movers.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <li
                  key={index}
                  className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5"
                >
                  <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/10" />
                  <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-white/5" />
                </li>
              ))
            : movers.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-base font-semibold text-white/90">{item.title}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {classifySentiment(item.priceYes)}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-[var(--bg)]/60 px-2 py-1 text-xs font-medium text-[var(--primary)] md:text-sm">
                      {formatChange(item.priceYes)}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)] md:text-sm">
                    <span>Liquidity</span>
                    <span className="text-white/90">
                      {currencyFormatter.format(item.liquidity ?? 0)}
                    </span>
                  </div>
                </li>
              ))}
        </ul>
      )}
    </Panel>
  );
}
