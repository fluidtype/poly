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
      <div className="card rounded-2xl border border-[rgb(var(--brand))]/40 bg-[rgb(var(--brand))]/10 p-5 text-sm text-[rgb(var(--accent-light))]">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card space-y-4 rounded-2xl bg-[rgb(var(--surface2))]/70 p-5">
        <div className="h-5 w-48 animate-pulse rounded-full bg-[rgb(var(--surface3))]/70" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`dataset-${index}`} className="h-5 w-full animate-pulse rounded-full bg-[rgb(var(--surface3))]/60" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`query-${index}`} className="h-4 w-full animate-pulse rounded-full bg-[rgb(var(--surface3))]/60" />
          ))}
        </div>
      </div>
    );
  }

  const hasContent = datasets.length > 0 || recentQueries.length > 0;

  if (!hasContent) {
    return (
      <div className="card rounded-2xl border border-dashed border-[rgb(var(--borderc))]/70 bg-[rgb(var(--surface2))]/70 p-5 text-sm text-[rgb(var(--muted))]">
        Activity will appear here once datasets begin syncing.
      </div>
    );
  }

  return (
    <div className="card flex h-full flex-col gap-6 rounded-2xl border border-[rgb(var(--borderc))]/70 bg-[rgb(var(--surface2))]/90 p-5">
      <header>
        <h3 className="text-base font-semibold text-[rgb(var(--text))]">System activity</h3>
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
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgb(var(--borderc))]/60 bg-[rgb(var(--surface))]/40 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-[rgb(var(--text))]">
                      {statusIcon && <span className="mr-2 align-middle text-lg">{statusIcon}</span>}
                      {dataset.label}
                    </span>
                    <span className="font-mono text-xs text-[rgb(var(--muted))]">
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
                          : "border-[rgb(var(--brand))]/40 bg-[rgb(var(--brand))]/15 text-[rgb(var(--accent-light))]",
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
                className="flex items-center justify-between rounded-xl border border-[rgb(var(--borderc))]/60 bg-[rgb(var(--surface))]/40 px-3 py-2"
              >
                <span className="truncate text-[rgb(var(--text))]">
                  {item.dataset ? (
                    <span className="pill mr-2 px-2 py-0 text-xs font-semibold text-[rgb(var(--accent-light))]">
                      {item.dataset}
                    </span>
                  ) : null}
                  {item.query}
                </span>
                <span className="font-mono text-[rgb(var(--muted))]">{formatTimestamp(item.timestamp)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default ActivityPanel;
