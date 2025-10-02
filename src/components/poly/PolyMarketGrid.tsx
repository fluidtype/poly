"use client"

import Link from "next/link"
import clsx from "clsx"

import type { PolyMarket } from "@/types"

interface PolyMarketGridProps {
  markets: PolyMarket[]
  onOpen?: (id: string) => void
  isLoading?: boolean
  error?: string | null
}

const formatNumber = (value?: number) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—"
  }

  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })}M`
  }

  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })}K`
  }

  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const formatPrice = (value?: number) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—"
  }

  return value.toLocaleString(undefined, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

const formatDate = (value: string | null) => {
  if (!value) {
    return "—"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  trading: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  expired: "bg-[color:var(--muted)]/10 text-[color:var(--muted)] border border-[color:var(--muted)]/30",
  resolved: "bg-blue-500/10 text-blue-300 border border-blue-500/30",
}

const getStatusClass = (status: string) => {
  const normalized = status.toLowerCase()
  return statusStyles[normalized] ?? "bg-[color:var(--surface-3)] text-[color:var(--muted)] border border-[color:var(--border)]/50"
}

export function PolyMarketGrid({
  markets,
  onOpen,
  isLoading = false,
  error,
}: PolyMarketGridProps) {
  if (error) {
    return (
      <div className="rounded-3xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
        <p className="font-medium">Unable to load Polymarket data</p>
        <p className="mt-1 opacity-80">{error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="card h-48 animate-pulse rounded-3xl bg-gradient-to-br from-[color:var(--surface-2)] via-[color:var(--surface-3)] to-[color:var(--surface-2)]"
          />
        ))}
      </div>
    )
  }

  if (!markets || markets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-[color:var(--surface)] to-[color:var(--surface-2)] p-6 text-sm text-[color:var(--muted)]">
        <p>No markets matched the current filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {markets.map((market) => (
        <div
          key={market.id}
          className="card flex h-full flex-col justify-between rounded-3xl border border-[color:var(--border)]/50 bg-[color:var(--surface-2)]/60 p-4 shadow-lg shadow-black/5"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-[color:var(--text)]">
                {market.title || "Untitled market"}
              </h3>
              <span
                className={clsx(
                  "ml-auto rounded-full px-3 py-1 text-xs font-medium capitalize",
                  getStatusClass(market.status),
                )}
              >
                {market.status || "unknown"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <span className="font-semibold">YES</span>
                <span>{formatPrice(market.priceYes)}</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
                <span className="font-semibold">NO</span>
                <span>{formatPrice(market.priceNo)}</span>
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-xs text-[color:var(--muted)] sm:grid-cols-3">
              <div>
                <dt className="font-medium text-[color:var(--muted)]">Volume 24h</dt>
                <dd className="mt-1 text-sm font-semibold text-[color:var(--text)]">${formatNumber(market.volume24h)}</dd>
              </div>
              <div>
                <dt className="font-medium text-[color:var(--muted)]">Liquidity</dt>
                <dd className="mt-1 text-sm font-semibold text-[color:var(--text)]">${formatNumber(market.liquidity)}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="font-medium text-[color:var(--muted)]">End Date</dt>
                <dd className="mt-1 text-sm font-semibold text-[color:var(--text)]">{formatDate(market.endDate)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => onOpen?.(market.id)}
              className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[color:var(--primary)]/30 transition hover:bg-[color:var(--primary-stronger)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)]"
            >
              Open
            </button>
            <Link
              href={market.id ? `https://polymarket.com/market/${market.id}` : "https://polymarket.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full border border-[color:var(--primary)]/40 bg-transparent px-4 py-2 text-sm font-semibold text-[color:var(--primary)] transition hover:bg-[color:var(--primary)]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)]"
            >
              View on Polymarket
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
