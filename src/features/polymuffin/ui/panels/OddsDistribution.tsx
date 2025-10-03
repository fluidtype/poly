"use client";

import { useMemo } from "react";

import type { PolyMarket } from "@/types";

interface OddsDistributionProps {
  markets: PolyMarket[];
  enabled: boolean;
  loading: boolean;
  error: string | null;
}

export default function OddsDistribution({ markets, enabled, loading, error }: OddsDistributionProps) {
  const stats = useMemo(() => {
    if (!enabled || markets.length === 0) {
      return null;
    }

    const safeMarkets = markets.slice(0, 20);
    const yesAverage = average(safeMarkets.map((market) => market.priceYes ?? 0));
    const noAverage = average(safeMarkets.map((market) => market.priceNo ?? 0));
    const bullish = safeMarkets.filter((market) => (market.priceYes ?? 0) >= 0.6).length;
    const bearish = safeMarkets.filter((market) => (market.priceYes ?? 0) <= 0.4).length;

    return {
      yesAverage,
      noAverage,
      bullish,
      bearish,
      total: safeMarkets.length,
    };
  }, [enabled, markets]);

  if (!enabled) {
    return (
      <div className="card flex h-full items-center justify-center text-sm text-[color:var(--muted)]">
        Enable Polymarket to unlock odds analytics.
      </div>
    );
  }

  if (error) {
    return (
      <div className="card flex h-full items-center justify-center text-sm text-[color:var(--accent-light)]">{error}</div>
    );
  }

  return (
    <div className="card flex h-full flex-col justify-between px-5 py-4">
      <header>
        <h3 className="text-base font-semibold text-[color:var(--fg)]">Odds distribution</h3>
        <p className="text-xs text-[color:var(--muted)]">Probability snapshot across top markets</p>
      </header>
      {loading || !stats ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-3 w-full animate-pulse rounded-full bg-[color:var(--panel-strong)]" />
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-4 text-sm text-[color:var(--muted)]">
          <Progress label="YES avg" value={stats.yesAverage * 100} accent="var(--accent)" />
          <Progress label="NO avg" value={stats.noAverage * 100} accent="var(--violet)" />
          <div className="flex items-center justify-between rounded-2xl border border-[color:var(--border)]/70 bg-[color:var(--panel)]/50 px-4 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em]">Confidence split</p>
              <p className="text-lg font-semibold text-[color:var(--fg)]">
                {stats.bullish}/{stats.total} bullish · {stats.bearish}/{stats.total} bearish
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function Progress({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em]">
        <span>{label}</span>
        <span className="text-sm font-semibold text-[color:var(--fg)]">{value.toFixed(1)}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-[color:var(--panel)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: accent }}
        />
      </div>
    </div>
  );
}
