"use client";

import { useEffect, useMemo, useState } from "react";

import type { PolymuffinMarket } from "@/types";

const PAGE_SIZE = 4;

type MarketsGridProps = {
  markets: PolymuffinMarket[];
  enabled: boolean;
  loading: boolean;
  error: string | null;
  onOpenMarket?: (id: string) => void;
};

export default function MarketsGrid({ markets, enabled, loading, error, onOpenMarket }: MarketsGridProps) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [markets]);

  const pages = Math.max(1, Math.ceil((markets?.length ?? 0) / PAGE_SIZE));
  const entries = useMemo(() => {
    if (!enabled) {
      return [];
    }
    const start = (page - 1) * PAGE_SIZE;
    return markets.slice(start, start + PAGE_SIZE);
  }, [enabled, markets, page]);

  if (!enabled) {
    return (
      <div className="card-surface card-hover flex h-full items-center justify-center rounded-2xl text-sm text-white/60">
        Enable Polymarket to browse active markets.
      </div>
    );
  }

  return (
    <div className="card-surface card-hover flex h-full flex-col overflow-hidden rounded-2xl">
      <Header page={page} pages={pages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(pages, p + 1))} />
      <div className="grid flex-1 grid-cols-2 gap-4 px-4 py-4 md:px-5">
        {loading ? (
          Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <div key={index} className="skeleton h-full rounded-2xl" />
          ))
        ) : error ? (
          <div className="col-span-2 flex items-center justify-center text-sm text-[#ff9da8]">{error}</div>
        ) : entries.length === 0 ? (
          <div className="col-span-2 flex items-center justify-center text-sm text-white/60">No markets available.</div>
        ) : (
          entries.map((market) => (
            <article
              key={market.id}
              className="card-surface card-surface--secondary card-hover flex flex-col gap-3 rounded-2xl p-4"
            >
              <header>
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">{market.category ?? "Market"}</p>
                <h4 className="mt-2 line-clamp-2 text-sm font-semibold tracking-tight text-white/90">
                  {market.title ?? "Untitled"}
                </h4>
              </header>
              <div className="flex gap-2 text-xs">
                <Tag label="YES" value={market.priceYes} />
                <Tag label="NO" value={market.priceNo} accent="var(--violet)" />
              </div>
              <dl className="grid grid-cols-2 gap-3 text-xs text-white/60">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.35em] text-white/40">Volume 24h</dt>
                  <dd className="mt-1 text-sm font-semibold text-white">${formatNumber(market.volume24h)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.35em] text-white/40">Liquidity</dt>
                  <dd className="mt-1 text-sm font-semibold text-white">${formatNumber(market.liquidity)}</dd>
                </div>
              </dl>
              <footer className="mt-auto flex items-center justify-between text-xs text-white/60">
                <button
                  type="button"
                  onClick={() => market.id && onOpenMarket?.(market.id)}
                  className="rounded-full border border-[color:var(--primary)]/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[color:var(--primary)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(11,11,14,0.7)]"
                >
                  Open details
                </button>
                {market.endDate ? <span>{formatDate(market.endDate)}</span> : null}
              </footer>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function Header({ page, pages, onPrev, onNext }: { page: number; pages: number; onPrev: () => void; onNext: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 md:px-5 md:py-4">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/70">Markets</h3>
      <div className="flex items-center gap-2 text-xs text-white/60">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/5 text-white/60 transition hover:border-[color:var(--primary)]/40 hover:text-white"
        >
          ◀
        </button>
        <span className="w-14 text-center font-semibold text-white">
          {page}/{pages}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/5 text-white/60 transition hover:border-[color:var(--primary)]/40 hover:text-white"
        >
          ▶
        </button>
      </div>
    </header>
  );
}

function Tag({ label, value, accent }: { label: string; value?: number | null; accent?: string }) {
  const display = value == null || Number.isNaN(value)
    ? "—"
    : `${(value * 100).toFixed(1)}%`;
  return (
    <span
      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80"
      style={{ background: accent ? `${accent}26` : "rgba(255,255,255,0.04)" }}
    >
      {label} {display}
    </span>
  );
}

function formatNumber(value?: number | null) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
