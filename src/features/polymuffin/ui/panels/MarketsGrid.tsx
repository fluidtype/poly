"use client";

import { useEffect, useMemo, useState } from "react";

import type { PolyMarket } from "@/types";

const PAGE_SIZE = 4;

type MarketsGridProps = {
  markets: PolyMarket[];
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
      <div className="card flex h-full items-center justify-center text-sm text-[color:var(--muted)]">
        Enable Polymarket to browse active markets.
      </div>
    );
  }

  return (
    <div className="card flex h-full flex-col">
      <Header page={page} pages={pages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(pages, p + 1))} />
      <div className="grid flex-1 grid-cols-2 gap-4 px-5 py-4">
        {loading ? (
          Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <div key={index} className="card h-full animate-pulse rounded-2xl bg-[color:var(--panel-strong)]/60" />
          ))
        ) : error ? (
          <div className="col-span-2 flex items-center justify-center text-sm text-[color:var(--accent-light)]">{error}</div>
        ) : entries.length === 0 ? (
          <div className="col-span-2 flex items-center justify-center text-sm text-[color:var(--muted)]">No markets available.</div>
        ) : (
          entries.map((market) => (
            <article key={market.id} className="card flex flex-col gap-3 rounded-2xl border border-[color:var(--border)]/70 bg-[color:var(--panel)]/60 p-4">
              <header>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted)]">{market.category ?? "Market"}</p>
                <h4 className="mt-1 line-clamp-2 text-sm font-semibold text-[color:var(--fg)]">{market.title ?? "Untitled"}</h4>
              </header>
              <div className="flex gap-2 text-xs">
                <Tag label="YES" value={market.priceYes} />
                <Tag label="NO" value={market.priceNo} accent="var(--violet)" />
              </div>
              <dl className="grid grid-cols-2 gap-3 text-xs text-[color:var(--muted)]">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.28em]">Volume 24h</dt>
                  <dd className="text-sm font-semibold text-[color:var(--fg)]">${formatNumber(market.volume24h)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.28em]">Liquidity</dt>
                  <dd className="text-sm font-semibold text-[color:var(--fg)]">${formatNumber(market.liquidity)}</dd>
                </div>
              </dl>
              <footer className="mt-auto flex items-center justify-between text-xs text-[color:var(--muted)]">
                <button
                  type="button"
                  onClick={() => market.id && onOpenMarket?.(market.id)}
                  className="rounded-full border border-[color:var(--accent)]/60 px-3 py-1 text-xs font-semibold text-[color:var(--fg)] transition hover:bg-[color:var(--accent)]/20"
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
    <header className="flex items-center justify-between border-b border-[color:var(--border)]/60 px-5 py-3">
      <h3 className="text-base font-semibold text-[color:var(--fg)]">Markets</h3>
      <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border)]/70 transition hover:border-[color:var(--accent)]/50 hover:text-[color:var(--fg)]"
        >
          ◀
        </button>
        <span className="w-14 text-center font-semibold text-[color:var(--fg)]">
          {page}/{pages}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border)]/70 transition hover:border-[color:var(--accent)]/50 hover:text-[color:var(--fg)]"
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
      className="rounded-full border border-[color:var(--border)]/70 px-3 py-1 font-semibold text-[color:var(--fg)]"
      style={{ background: accent ? `${accent}33` : "var(--panel-strong)" }}
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
