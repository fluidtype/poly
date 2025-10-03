"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useGlobalFilters } from "@/stores/useGlobalFilters";

const MAX_RECORDS = 25;

type GdeltResponse = Record<string, unknown>;

type NormalizedStory = {
  id: string;
  title: string;
  url?: string;
  outlet?: string;
  published?: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function buildParams(keywords: string[], dateStart: string, dateEnd: string) {
  const params = new URLSearchParams({
    action: "context",
    date_start: dateStart,
    date_end: dateEnd,
    limit: String(MAX_RECORDS),
  });

  if (keywords.length > 0) {
    params.set("keywords", keywords.join(","));
  }

  return params.toString();
}

async function fetchGdelt(params: string) {
  const response = await fetch(`/api/gdelt?${params}`, { cache: "no-store" });
  const data = (await response.json()) as GdeltResponse;

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: unknown }).message ?? "Unable to load GDELT data")
        : "Unable to load GDELT data";
    throw new Error(message);
  }

  return data;
}

function toStoryId(candidate: unknown, fallback: string) {
  if (typeof candidate === "string" && candidate.length > 0) {
    return candidate;
  }

  return fallback;
}

function pickString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function normalizeStories(payload: unknown): NormalizedStory[] {
  const sourceArray: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as Record<string, unknown>)?.articles)
      ? (((payload as Record<string, unknown>).articles as unknown[]))
      : Array.isArray((payload as Record<string, unknown>)?.artlist)
        ? (((payload as Record<string, unknown>).artlist as unknown[]))
        : Array.isArray((payload as Record<string, unknown>)?.results)
          ? (((payload as Record<string, unknown>).results as unknown[]))
          : [];

  return sourceArray
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return undefined;
      }

      const record = item as Record<string, unknown>;
      const title =
        pickString(record, [
          "title",
          "articleTitle",
          "documentTitle",
          "headline",
          "transTitle",
        ]) ?? "Untitled story";

      const url = pickString(record, ["url", "docUrl", "articleUrl"]);
      const outlet = pickString(record, ["source", "publisher", "domain", "sourceName"]);
      const publishedRaw = pickString(record, ["date", "seendate", "published", "timestamp"]);

      return {
        id: toStoryId(url ?? pickString(record, ["guid", "id"]) ?? null, `gdelt-${index}`),
        title,
        url: url ?? undefined,
        outlet: outlet ?? undefined,
        published: publishedRaw ?? undefined,
      } satisfies NormalizedStory;
    })
    .filter((story): story is NormalizedStory => Boolean(story));
}

function formatPublished(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return dateFormatter.format(parsed);
  }

  if (/^\d{8}/u.test(value)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));
    const hours = Number(value.slice(9, 11) || 0);
    const minutes = Number(value.slice(11, 13) || 0);
    const fallback = new Date(Date.UTC(year, month, day, hours, minutes));
    if (!Number.isNaN(fallback.getTime())) {
      return dateFormatter.format(fallback);
    }
  }

  return value;
}

export default function GdeltPanel() {
  const keywords = useGlobalFilters((state) => state.keywords);
  const datasets = useGlobalFilters((state) => state.datasets);
  const dateStart = useGlobalFilters((state) => state.dateStart);
  const dateEnd = useGlobalFilters((state) => state.dateEnd);

  const queryParams = useMemo(
    () => buildParams(keywords, dateStart, dateEnd),
    [keywords, dateStart, dateEnd]
  );

  const shouldFetch = datasets.gdelt && keywords.length > 0;

  const { data, error, isFetching, isPending } = useQuery({
    queryKey: ["gdeltContext", { queryParams }],
    queryFn: () => fetchGdelt(queryParams),
    enabled: shouldFetch,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const loading = isFetching || isPending;
  const stories = useMemo(() => (data ? normalizeStories(data) : []), [data]);

  return (
    <section className="card md:col-span-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--text)]">News pulse</h2>
          <p className="text-sm text-[color:var(--muted)]">
            {keywords.length > 0
              ? "Latest coverage sourced from GDELT"
              : "Enter keywords to pull related coverage"}
          </p>
        </div>
        {loading && (
          <span className="flex items-center gap-2 text-xs uppercase tracking-wide text-[color:var(--muted)]">
            <span className="h-2 w-2 animate-ping rounded-full bg-[color:var(--primary)]" aria-hidden />
            Loading…
          </span>
        )}
      </header>

      {!datasets.gdelt ? (
        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--border)]/80 bg-[color:var(--surface-2)]/40 p-6 text-center text-sm text-[color:var(--muted)]">
          Enable the GDELT dataset to surface recent coverage.
        </div>
      ) : keywords.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--border)]/80 bg-[color:var(--surface-2)]/40 p-6 text-center text-sm text-[color:var(--muted)]">
          Start typing in the search bar and press Enter to fetch matching articles.
        </div>
      ) : error ? (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
          {(error as Error).message}
        </div>
      ) : stories.length === 0 && !loading ? (
        <div className="mt-4 rounded-xl border border-dashed border-[color:var(--border)]/80 bg-[color:var(--surface-2)]/40 p-6 text-center text-sm text-[color:var(--muted)]">
          No recent coverage found for the current filters.
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {stories.slice(0, 10).map((story) => {
            const published = formatPublished(story.published);

            return (
              <li
                key={story.id}
                className="rounded-2xl border border-[color:var(--border)]/80 bg-[color:var(--surface-2)]/60 p-4 text-sm shadow-sm transition hover:border-[color:var(--primary)]/35"
              >
                <div className="flex flex-col gap-2">
                  {story.url ? (
                    <a
                      href={story.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-[color:var(--text)] transition hover:text-[color:var(--primary)]"
                    >
                      {story.title}
                    </a>
                  ) : (
                    <span className="text-base font-semibold text-[color:var(--text)]">{story.title}</span>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)]">
                    {story.outlet && <span>{story.outlet}</span>}
                    {published && <span>{published}</span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
