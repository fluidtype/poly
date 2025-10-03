"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchGdeltContextData } from "@/hooks/useGdeltContext";
import { commonQueryOptions } from "@/hooks/utils";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

import { Panel } from "./panel";

type FeedItem = {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
  url?: string;
  tone: "positive" | "negative" | "neutral";
};

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function parseTimestamp(raw: unknown) {
  if (typeof raw === "number" || (typeof raw === "string" && /^\d{8}$/u.test(raw))) {
    const value = String(raw);
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    const parsed = new Date(Date.UTC(year, month, day));
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  if (typeof raw === "string" || raw instanceof Date) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

function buildToneCategory(value: unknown): FeedItem["tone"] {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "neutral";
  }

  if (value >= 3) {
    return "positive";
  }

  if (value <= -3) {
    return "negative";
  }

  return "neutral";
}

function extractFeed(data?: Awaited<ReturnType<typeof fetchGdeltContextData>>): FeedItem[] {
  if (!data?.events?.length) {
    return [];
  }

  return data.events.slice(0, 12).map((event, index) => {
    const actor1 =
      typeof (event as { Actor1Name?: unknown }).Actor1Name === "string"
        ? (event as { Actor1Name: string }).Actor1Name
        : event.Actor1CountryCode;
    const actor2 =
      typeof (event as { Actor2Name?: unknown }).Actor2Name === "string"
        ? (event as { Actor2Name: string }).Actor2Name
        : event.Actor2CountryCode;

    const title = actor1 && actor2 ? `${actor1} → ${actor2}` : actor1 ?? actor2 ?? "GDELT event";

    const timestamp = (() => {
      const parsed = parseTimestamp(event.SQLDATE);
      return parsed ? timestampFormatter.format(parsed) : "Recently";
    })();

    const url = typeof event.SOURCEURL === "string" && event.SOURCEURL.length > 0 ? event.SOURCEURL : undefined;

    const tone = buildToneCategory((event as { AvgTone?: unknown }).AvgTone as number | undefined);

    const summaryParts: string[] = [];
    if (event.EventCode) {
      summaryParts.push(`Event code ${event.EventCode}`);
    }
    if (typeof (event as { ActionGeo_CountryCode?: string }).ActionGeo_CountryCode === "string") {
      summaryParts.push(`Geo ${String((event as { ActionGeo_CountryCode: string }).ActionGeo_CountryCode)}`);
    }
    if (url) {
      try {
        const domain = new URL(url).hostname.replace(/^www\./u, "");
        summaryParts.push(domain);
      } catch {
        summaryParts.push("Source link");
      }
    }

    return {
      id: `${event.SQLDATE ?? "event"}-${index}`,
      title,
      summary: summaryParts.join(" • ") || "Signal detected across monitored actors",
      timestamp,
      url,
      tone,
    } satisfies FeedItem;
  });
}

export function ActivityFeedPanel({ className }: { className?: string }) {
  const keywords = useGlobalFilters((state) => state.keywords);
  const dateStart = useGlobalFilters((state) => state.dateStart);
  const dateEnd = useGlobalFilters((state) => state.dateEnd);
  const datasets = useGlobalFilters((state) => state.datasets);

  const queryEnabled =
    datasets.gdelt && keywords.length > 0 && Boolean(dateStart) && Boolean(dateEnd);

  const queryKey = useMemo(
    () => ({
      keywords: keywords.join("|"),
      dateStart,
      dateEnd,
    }),
    [dateEnd, dateStart, keywords],
  );

  const { data, error, isFetching, isPending } = useQuery({
    queryKey: ["dashboard", "gdelt", "context", queryKey],
    queryFn: ({ signal }) =>
      fetchGdeltContextData(
        {
          dateStart,
          dateEnd,
          keywords,
          limit: 400,
          includeInsights: true,
        },
        fetch,
        signal,
      ),
    enabled: queryEnabled,
    ...commonQueryOptions,
  });

  const loading = isFetching || isPending;
  const items = useMemo(() => extractFeed(data), [data]);

  const showNoKeywords = datasets.gdelt && keywords.length === 0;
  const showDisabled = !datasets.gdelt;
  const showEmpty = !loading && !error && queryEnabled && items.length === 0;

  return (
    <Panel
      className={className}
      title="Activity manager"
      eyebrow="Workflow"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          {loading ? "Triaging…" : "Auto triage on"}
        </span>
      }
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        {showDisabled ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--panel-2)]/50 p-4 text-center text-sm text-[var(--muted)]">
            Enable the GDELT dataset to receive triaged activity.
          </div>
        ) : showNoKeywords ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--panel-2)]/50 p-4 text-center text-sm text-[var(--muted)]">
            Provide keywords in the search bar to surface matched events.
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
            {(error as Error).message}
          </div>
        ) : showEmpty ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--panel-2)]/50 p-4 text-center text-sm text-[var(--muted)]">
            No data for selected filters.
          </div>
        ) : (
          <>
            <ul className="max-h-full flex-1 space-y-3 overflow-y-auto pr-2 [scrollbar-width:thin]">
              {loading && items.length === 0
                ? Array.from({ length: 5 }).map((_, index) => (
                    <li
                      key={index}
                      className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5"
                    >
                      <div className="h-4 w-20 animate-pulse rounded-full bg-white/10" />
                      <div className="mt-3 h-5 w-3/4 animate-pulse rounded-full bg-white/10" />
                      <div className="mt-2 h-4 w-1/2 animate-pulse rounded-full bg-white/5" />
                    </li>
                  ))
                : items.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5"
                    >
                      <div className="flex items-center justify-between text-xs text-[var(--muted)] md:text-sm">
                        <span>{item.timestamp}</span>
                        <span
                          className="rounded-full border border-white/10 bg-[var(--bg)]/60 px-2 py-1 text-xs font-medium"
                          style={{
                            color:
                              item.tone === "positive"
                                ? "var(--primary)"
                                : item.tone === "negative"
                                  ? "var(--tertiary)"
                                  : "var(--muted)",
                          }}
                        >
                          {item.tone === "positive"
                            ? "Positive tone"
                            : item.tone === "negative"
                              ? "Adverse tone"
                              : "Neutral tone"}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-white/90">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition hover:text-[var(--primary)]"
                          >
                            {item.title}
                          </a>
                        ) : (
                          item.title
                        )}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--muted)]">{item.summary}</p>
                    </li>
                  ))}
            </ul>
            <button
              type="button"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-[var(--panel-2)]/70 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition hover:text-[var(--fg)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-0 md:text-sm"
            >
              View queue
            </button>
          </>
        )}
      </div>
    </Panel>
  );
}

