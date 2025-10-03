"use client";

import { useMemo } from "react";

import { usePolySearch } from "@/hooks/usePolySearch";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

import { Panel } from "./panel";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function resolveStatus(price?: number) {
  if (typeof price !== "number" || Number.isNaN(price)) {
    return { label: "Watch", className: "text-[var(--muted)]" };
  }

  if (price >= 0.65) {
    return { label: "Opportunity", className: "text-[var(--primary)]" };
  }

  if (price <= 0.35) {
    return { label: "Alert", className: "text-[var(--tertiary)]" };
  }

  return { label: "Watch", className: "text-[var(--muted)]" };
}

export function Signals({ className }: { className?: string }) {
  const keywords = useGlobalFilters((state) => state.keywords);
  const datasets = useGlobalFilters((state) => state.datasets);

  const { data, error, isFetching, isPending } = usePolySearch({
    q: keywords.join(" ") || undefined,
    active: true,
    limit: 20,
    sort: "liquidity",
    enabled: datasets.poly,
  });

  const loading = isPending || isFetching;
  const markets = useMemo(() => data?.markets ?? [], [data?.markets]);

  const signals = useMemo(() => {
    if (!markets.length) {
      return [];
    }

    return markets.slice(0, 5).map((market) => {
      const status = resolveStatus(market.priceYes);
      return {
        id: market.id,
        title: market.title,
        detail: `24h vol ${currencyFormatter.format(market.volume24h ?? 0)} · Liquidity ${currencyFormatter.format(market.liquidity ?? 0)}`,
        status,
      };
    });
  }, [markets]);

  const showDisabled = !datasets.poly;
  const showEmpty = !loading && !error && datasets.poly && signals.length === 0;

  return (
    <Panel
      className={className}
      title="Monitoring grid"
      eyebrow="Signals"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          {loading ? "Syncing…" : "Sync live"}
        </span>
      }
    >
      {showDisabled ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--panel-2)]/50 p-4 text-center text-sm text-[var(--muted)]">
          Enable the Polymarket dataset to surface trading signals.
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
        <ul className="max-h-full flex flex-1 flex-col gap-3 overflow-y-auto pr-1 text-sm text-[var(--muted)] [scrollbar-width:thin]">
          {loading && signals.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <li
                  key={index}
                  className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5"
                >
                  <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/10" />
                  <div className="mt-3 h-4 w-2/3 animate-pulse rounded-full bg-white/5" />
                </li>
              ))
            : signals.map((signal) => (
                <li
                  key={signal.id}
                  className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-white/90">{signal.title}</p>
                    <span
                      className={`rounded-full border border-white/10 bg-[var(--bg)]/60 px-2 py-1 text-xs font-medium md:text-sm ${signal.status.className}`}
                    >
                      {signal.status.label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--muted)]">{signal.detail}</p>
                </li>
              ))}
        </ul>
      )}
    </Panel>
  );
}
