"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { NormalizedMarket } from "@/app/api/polymuffin/helpers";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

const DEFAULT_LIMIT = 40;

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

type PolymuffinResponse = {
  status: "success" | "error";
  message?: string;
  count?: number;
  markets?: NormalizedMarket[];
};

function buildQueryParams(keywords: string[]) {
  const params = new URLSearchParams({
    active: "true",
    limit: String(DEFAULT_LIMIT),
  });

  if (keywords.length > 0) {
    params.set("q", keywords.join(" "));
  }

  return params.toString();
}

async function fetchPolymuffinMarkets(params: string) {
  const response = await fetch(`/api/polymuffin?${params}`, { cache: "no-store" });
  const data = (await response.json()) as PolymuffinResponse;

  if (!response.ok || data.status === "error") {
    const message = data.message ?? "Unable to load Polymarket data";
    throw new Error(message);
  }

  return {
    count: data.count ?? data.markets?.length ?? 0,
    markets: data.markets ?? [],
  };
}

function resolvePrice(value?: number) {
  if (value === undefined || Number.isNaN(value)) {
    return "--";
  }

  if (value <= 1) {
    return priceFormatter.format(value);
  }

  return Number.isFinite(value) ? `$${value.toFixed(2)}` : "--";
}

export default function PolymarketPanel() {
  const keywords = useGlobalFilters((state) => state.keywords);
  const datasets = useGlobalFilters((state) => state.datasets);

  const queryParams = useMemo(() => buildQueryParams(keywords), [keywords]);

  const { data, error, isPending, isFetching } = useQuery({
    queryKey: ["polymuffinMarkets", { queryParams }],
    queryFn: () => fetchPolymuffinMarkets(queryParams),
    enabled: datasets.polymuffin,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const loading = isPending || isFetching;

  if (!datasets.polymuffin) {
    return (
      <section className="card md:col-span-8">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--text)]">Polymarket markets</h2>
            <p className="text-sm text-[color:var(--muted)]">
              Enable the Polymarket dataset from the search bar to see results.
            </p>
          </div>
        </header>
      </section>
    );
  }

  const markets = data?.markets ?? [];
  const resultCount = data?.count ?? markets.length;

  return (
    <section className="card md:col-span-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--text)]">Polymarket markets</h2>
          <p className="text-sm text-[color:var(--muted)]">
            {keywords.length > 0
              ? `Showing matches for “${keywords.join(" ")}”`
              : "Trending markets from Polymarket Gamma"}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-[color:var(--muted)]">
          {!loading && (
            <span className="rounded-full border border-white/5 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--text)]/80">
              {resultCount} result{resultCount === 1 ? "" : "s"}
            </span>
          )}
          {loading && (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-ping rounded-full bg-[color:var(--primary)]" aria-hidden />
              Loading…
            </span>
          )}
        </div>
      </header>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
          {(error as Error).message}
        </div>
      ) : markets.length === 0 && !loading ? (
        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--border)]/80 bg-[color:var(--surface-2)]/40 p-6 text-center text-sm text-[color:var(--muted)]">
          No markets found. Try adjusting your keywords or clearing filters.
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {markets.slice(0, 12).map((market) => {
            const yesPrice = resolvePrice(market.priceYes);
            const noPrice = resolvePrice(market.priceNo);
            const parsedEnd = market.endDate ? new Date(market.endDate) : null;
            const endLabel =
              parsedEnd && !Number.isNaN(parsedEnd.getTime())
                ? parsedEnd.toLocaleString()
                : market.endDate ?? undefined;

            return (
              <li
                key={market.id}
                className="rounded-2xl border border-[color:var(--border)]/80 bg-[color:var(--surface-2)]/60 p-4 shadow-sm transition hover:border-[color:var(--primary)]/35"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-[color:var(--text)]">{market.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)]">
                      {market.category && (
                        <span className="rounded-full border border-white/5 bg-white/5 px-2 py-0.5 text-[11px] uppercase tracking-wide">
                          {market.category}
                        </span>
                      )}
                      {endLabel && <span>Ends {endLabel}</span>}
                      <span>24h vol {numberFormatter.format(market.volume24h)}</span>
                      <span>Liquidity {numberFormatter.format(market.liquidity)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="text-right">
                      <span className="block text-xs uppercase tracking-wide text-[color:var(--muted)]">YES</span>
                      <span className="text-base font-semibold text-[color:var(--text)]">{yesPrice}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs uppercase tracking-wide text-[color:var(--muted)]">NO</span>
                      <span className="text-base font-semibold text-[color:var(--text)]">{noPrice}</span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
