"use client";

import clsx from "clsx";

interface DatasetStatus {
  id: string;
  label: string;
  lastFetched?: string;
  status?: "green" | "yellow" | "red";
  fallback?: string | null;
  enabled?: boolean;
}

interface RecentQuery {
  query: string;
  timestamp: string;
  dataset?: string;
}

interface ActivityPanelProps {
  datasets?: DatasetStatus[];
  recentQueries?: RecentQuery[];
  isLoading?: boolean;
  error?: string | null;
}

const STATUS_ICON: Record<NonNullable<DatasetStatus["status"]>, string> = {
  green: "🟢",
  yellow: "🟡",
  red: "🔴",
};

const formatTimestamp = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().replace("T", " ").slice(0, 19);
};

export function ActivityPanel({ datasets = [], recentQueries = [], isLoading = false, error }: ActivityPanelProps) {
  if (error) {
    return (
      <div className="card rounded-2xl border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 p-5 text-sm text-[color:var(--accent-light)]">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card space-y-4 rounded-2xl bg-[color:var(--card)]/70 p-5">
        <div className="h-5 w-48 animate-pulse rounded-full bg-[color:var(--elev-2)]/70" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`dataset-${index}`} className="h-5 w-full animate-pulse rounded-full bg-[color:var(--elev-2)]/60" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`query-${index}`} className="h-4 w-full animate-pulse rounded-full bg-[color:var(--elev-2)]/60" />
          ))}
        </div>
      </div>
    );
  }

  const hasContent = datasets.length > 0 || recentQueries.length > 0;

  if (!hasContent) {
    return (
      <div className="card rounded-2xl border border-dashed border-[color:var(--border)]/70 bg-[color:var(--card)]/70 p-5 text-sm text-[color:var(--muted)]">
        Activity will appear here once datasets begin syncing.
      </div>
    );
  }

  return (
    <div className="card flex h-full flex-col gap-6 rounded-2xl border border-[color:var(--border)]/70 bg-[color:var(--card)]/90 p-5">
      <header>
        <h3 className="text-base font-semibold text-[color:var(--fg)]">System activity</h3>
        <p className="meta mt-1">Latest synchronization status across connected datasets.</p>
      </header>

      {datasets.length > 0 && (
        <section className="space-y-3">
          <h4 className="meta uppercase tracking-[0.2em]">Dataset health</h4>
          <ul className="space-y-2 text-sm">
            {datasets.map((dataset) => {
              const statusIcon = dataset.status ? STATUS_ICON[dataset.status] : "";
              return (
                <li
                  key={dataset.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--border)]/60 bg-[color:var(--panel)]/40 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-[color:var(--fg)]">
                      {statusIcon && <span className="mr-2 align-middle text-lg">{statusIcon}</span>}
                      {dataset.label}
                    </span>
                    <span className="font-mono text-xs text-[color:var(--muted)]">
                      Last fetch: {formatTimestamp(dataset.lastFetched)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {dataset.fallback && (
                      <span className="pill px-2 py-0 text-xs font-semibold text-amber-300">
                        ⚠️ {dataset.fallback}
                      </span>
                    )}
                    <span
                      className={clsx(
                        "pill px-2 py-0 text-xs font-semibold",
                        dataset.enabled
                          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                          : "border-[color:var(--accent)]/40 bg-[color:var(--accent)]/15 text-[color:var(--accent-light)]",
                      )}
                    >
                      {dataset.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {recentQueries.length > 0 && (
        <section className="space-y-3">
          <h4 className="meta uppercase tracking-[0.2em]">Recent queries</h4>
          <ul className="space-y-2 text-xs">
            {recentQueries.slice(0, 6).map((item, index) => (
              <li
                key={`${item.timestamp}-${index}`}
                className="flex items-center justify-between rounded-xl border border-[color:var(--border)]/60 bg-[color:var(--panel)]/40 px-3 py-2"
              >
                <span className="truncate text-[color:var(--fg)]">
                  {item.dataset ? (
                    <span className="pill mr-2 px-2 py-0 text-xs font-semibold text-[color:var(--accent-light)]">
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
  );
}

export default ActivityPanel;
