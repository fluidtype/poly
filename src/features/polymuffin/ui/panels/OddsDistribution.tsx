"use client";

import { useMemo } from "react";

import type { PolymuffinMarket } from "@/types";

interface OddsDistributionProps {
  markets: PolymuffinMarket[];
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
      <div className="card-surface card-surface--secondary card-hover flex h-full items-center justify-center rounded-2xl text-sm text-white/60">
        Enable Polymarket to unlock odds analytics.
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-surface card-surface--secondary card-hover flex h-full items-center justify-center rounded-2xl text-sm text-[#ff9da8]">
        {error}
      </div>
    );
  }

  return (
    <div className="card-surface card-surface--secondary card-hover flex h-full flex-col justify-between rounded-2xl p-4 md:p-5">
      <header className="space-y-1">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/70">Odds distribution</h3>
        <p className="text-[11px] text-white/50">Probability snapshot across top markets</p>
      </header>
      {loading || !stats ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-3 w-full rounded-full bg-white/5">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[color:var(--primary)]/40 to-[color:var(--accent)]/30" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-4 text-sm text-white/60">
          <Progress label="YES avg" value={stats.yesAverage * 100} accent="var(--accent)" />
          <Progress label="NO avg" value={stats.noAverage * 100} accent="var(--violet)" />
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Confidence split</p>
              <p className="mt-2 text-[18px] font-semibold tracking-tight text-white">
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
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-white/40">
        <span>{label}</span>
        <span className="text-sm font-semibold text-white">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-white/5">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            background: `linear-gradient(90deg, ${accent} 0%, rgba(163, 71, 255, 0.5) 100%)`,
          }}
        />
      </div>
    </div>
  );
}
