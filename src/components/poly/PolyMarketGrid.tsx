"use client";

import Link from "next/link";
import clsx from "clsx";

import type { PolyMarket } from "@/types";

interface PolyMarketGridProps {
  markets: PolyMarket[];
  onOpen?: (id: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const formatNumber = (value?: number) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })}K`;
  }

  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const formatPrice = (value?: number) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return value.toLocaleString(undefined, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};

const formatDate = (value: string | null) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40",
  trading: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40",
  expired: "bg-[rgb(var(--muted))]/10 text-[rgb(var(--muted))] border border-[rgb(var(--muted))]/30",
  resolved: "bg-[rgb(var(--tertiary))]/15 text-[rgb(var(--violet-light))] border border-[rgb(var(--tertiary))]/40",
};

const getStatusClass = (status: string) => {
  const normalized = status.toLowerCase();
  return statusStyles[normalized] ?? "bg-[rgb(var(--surface))]/60 text-[rgb(var(--muted))] border border-[rgb(var(--borderc))]/60";
};

export function PolyMarketGrid({
  markets,
  onOpen,
  isLoading = false,
  error,
}: PolyMarketGridProps) {
  if (error) {
    return (
      <div className="card rounded-2xl border border-[rgb(var(--brand))]/40 bg-[rgb(var(--brand))]/10 p-5 text-sm text-[rgb(var(--accent-light))]">
        <p className="font-medium">Unable to load Polymarket data</p>
        <p className="mt-1 opacity-80">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card h-48 animate-pulse rounded-2xl bg-[rgb(var(--surface3))]/60" />
        ))}
      </div>
    );
  }

  if (!markets || markets.length === 0) {
    return (
      <div className="card flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--borderc))]/70 bg-[rgb(var(--surface2))]/70 p-6 text-sm text-[rgb(var(--muted))]">
        <p>No markets matched the current filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {markets.map((market) => (
        <div
          key={market.id}
          className="card flex h-full flex-col gap-4 rounded-2xl border border-[rgb(var(--borderc))]/70 bg-[rgb(var(--surface2))]/90 p-5"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[rgb(var(--text))]">
                {market.title || "Untitled market"}
              </h3>
              <span
                className={clsx(
                  "pill px-3 py-0 text-xs font-medium capitalize",
                  getStatusClass(market.status),
                )}
              >
                {market.status || "unknown"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="pill gap-2 border-emerald-400/40 bg-emerald-500/10 text-xs font-medium text-emerald-200">
                <span className="font-semibold">YES</span>
                <span>{formatPrice(market.priceYes)}</span>
              </span>
              <span className="pill gap-2 border-[rgb(var(--brand))]/40 bg-[rgb(var(--brand))]/15 text-xs font-medium text-[rgb(var(--accent-light))]">
                <span className="font-semibold">NO</span>
                <span>{formatPrice(market.priceNo)}</span>
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-xs text-[rgb(var(--muted))]">
              <div>
                <dt className="font-medium uppercase tracking-[0.18em]">Volume 24h</dt>
                <dd className="mt-1 text-sm font-semibold text-[rgb(var(--text))]">${formatNumber(market.volume24h)}</dd>
              </div>
              <div>
                <dt className="font-medium uppercase tracking-[0.18em]">Liquidity</dt>
                <dd className="mt-1 text-sm font-semibold text-[rgb(var(--text))]">${formatNumber(market.liquidity)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-medium uppercase tracking-[0.18em]">End Date</dt>
                <dd className="mt-1 text-sm font-semibold text-[rgb(var(--text))]">{formatDate(market.endDate)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-auto grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onOpen?.(market.id)}
              className="pill-active inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow-none transition hover:brightness-110"
            >
              Open
            </button>
            <Link
              href={
                market.slug
                  ? `https://polymarket.com/market/${market.slug}`
                  : market.id
                  ? `https://polymarket.com/market/${market.id}`
                  : "https://polymarket.com"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="pill inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[rgb(var(--accent-light))] transition hover:border-[rgb(var(--brand))]/50 hover:bg-[rgb(var(--brand))]/10"
            >
              View on Polymarket
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
