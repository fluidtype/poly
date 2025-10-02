"use client"

import clsx from "clsx"

interface DatasetStatus {
  id: string
  label: string
  lastFetched?: string
  status?: "green" | "yellow" | "red"
  fallback?: string | null
  enabled?: boolean
}

interface RecentQuery {
  query: string
  timestamp: string
  dataset?: string
}

interface ActivityPanelProps {
  datasets?: DatasetStatus[]
  recentQueries?: RecentQuery[]
  isLoading?: boolean
  error?: string | null
}

const STATUS_ICON: Record<NonNullable<DatasetStatus["status"]>, string> = {
  green: "🟢",
  yellow: "🟡",
  red: "🔴",
}

const formatTimestamp = (value?: string) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toISOString().replace("T", " ").slice(0, 19)
}

export function ActivityPanel({ datasets = [], recentQueries = [], isLoading = false, error }: ActivityPanelProps) {
  if (error) {
    return (
      <div className="card compact rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="card compact space-y-4 rounded-2xl bg-gradient-to-br from-[color:var(--surface-2)] via-[color:var(--surface-3)] to-[color:var(--surface-2)] p-4">
        <div className="h-5 w-48 animate-pulse rounded-full bg-white/10" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`dataset-${index}`} className="h-5 w-full animate-pulse rounded-full bg-white/10" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`query-${index}`} className="h-4 w-full animate-pulse rounded-full bg-white/10" />
          ))}
        </div>
      </div>
    )
  }

  const hasContent = datasets.length > 0 || recentQueries.length > 0

  if (!hasContent) {
    return (
      <div className="card compact rounded-2xl border border-dashed border-[color:var(--border)]/60 bg-[color:var(--surface-2)]/50 p-4 text-sm text-[color:var(--muted)]">
        Activity will appear here once datasets begin syncing.
      </div>
    )
  }

  return (
    <div className="card compact space-y-6 rounded-2xl border border-[color:var(--border)]/60 bg-[color:var(--surface-2)]/60 p-4 shadow-sm shadow-black/5">
      <header>
        <h3 className="text-base font-semibold text-[color:var(--text)]">System activity</h3>
        <p className="text-xs text-[color:var(--muted)]">Latest synchronization status across connected datasets.</p>
      </header>

      {datasets.length > 0 && (
        <section className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">Dataset health</h4>
          <ul className="space-y-2 text-sm">
            {datasets.map((dataset) => {
              const statusIcon = dataset.status ? STATUS_ICON[dataset.status] : ""
              return (
                <li
                  key={dataset.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[color:var(--surface-3)]/40 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-[color:var(--text)]">
                      {statusIcon && <span className="mr-2 align-middle text-lg">{statusIcon}</span>}
                      {dataset.label}
                    </span>
                    <span className="font-mono text-xs text-[color:var(--muted)]">
                      Last fetch: {formatTimestamp(dataset.lastFetched)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {dataset.fallback && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-300">
                        ⚠️ {dataset.fallback}
                      </span>
                    )}
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium",
                        dataset.enabled
                          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                          : "border-red-400/40 bg-red-500/10 text-red-200"
                      )}
                    >
                      {dataset.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {recentQueries.length > 0 && (
        <section className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">Recent queries</h4>
          <ul className="space-y-2 text-xs">
            {recentQueries.slice(0, 6).map((item, index) => (
              <li
                key={`${item.timestamp}-${index}`}
                className="flex items-center justify-between rounded-xl border border-[color:var(--border)]/50 bg-[color:var(--surface-3)]/30 px-3 py-2"
              >
                <span className="truncate text-[color:var(--text)]">
                  {item.dataset ? (
                    <span className="mr-2 rounded-full bg-[color:var(--primary)]/15 px-2 py-0.5 font-semibold text-[color:var(--primary)]">
                      {item.dataset}
                    </span>
                  ) : null}
                  {item.query}
                </span>
                <span className="font-mono text-[color:var(--muted)]">{formatTimestamp(item.timestamp)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default ActivityPanel
