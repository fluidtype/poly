"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchGdeltContextData } from "@/hooks/useGdeltContext";
import { commonQueryOptions } from "@/hooks/utils";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

import { Panel } from "./panel";

type Highlight = {
  title: string;
  description: string;
  confidence: number;
};

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function Highlights({ className }: { className?: string }) {
  const keywords = useGlobalFilters((state) => state.keywords);
  const datasets = useGlobalFilters((state) => state.datasets);
  const dateStart = useGlobalFilters((state) => state.dateStart);
  const dateEnd = useGlobalFilters((state) => state.dateEnd);

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

  const loading = isPending || isFetching;

  const highlights = useMemo(() => {
    const keywordMatches = data?.insights?.keyword_matches ?? {};
    const entries = Object.entries(keywordMatches)
      .filter((entry): entry is [string, number] => typeof entry[0] === "string" && typeof entry[1] === "number")
      .sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
      return [] as Highlight[];
    }

    const topTotal = entries.reduce((sum, [, value]) => sum + value, 0) || 1;

    return entries.slice(0, 5).map(([keyword, value]) => ({
      title: keyword,
      description: `${percentFormatter.format((value / topTotal) * 100)}% of matched coverage`,
      confidence: (value / topTotal) * 100,
    }));
  }, [data]);

  const showDisabled = !datasets.gdelt;
  const showNoKeywords = datasets.gdelt && keywords.length === 0;
  const showEmpty = !loading && !error && queryEnabled && highlights.length === 0;

  return (
    <Panel
      className={className}
      title="Highlights feed"
      eyebrow="Narratives"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          {loading ? "Curating…" : "Curated hourly"}
        </span>
      }
    >
      {showDisabled ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--panel-2)]/50 p-4 text-center text-sm text-[var(--muted)]">
          Enable the GDELT dataset to surface highlighted narratives.
        </div>
      ) : showNoKeywords ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[var(--panel-2)]/50 p-4 text-center text-sm text-[var(--muted)]">
          Provide keywords in the search bar to generate highlights.
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
        <ul className="max-h-full flex flex-1 flex-col gap-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
          {loading && highlights.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <li
                  key={index}
                  className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5"
                >
                  <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/10" />
                  <div className="mt-3 h-4 w-2/3 animate-pulse rounded-full bg-white/5" />
                </li>
              ))
            : highlights.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-white/5 bg-[var(--panel-2)]/60 p-4 md:p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-white/90">{item.title}</h3>
                      <p className="mt-2 text-sm text-[var(--muted)]">{item.description}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-[var(--bg)]/60 px-2 py-1 text-xs text-[var(--muted)] md:text-sm">
                      {percentFormatter.format(item.confidence)}%
                    </span>
                  </div>
                </li>
              ))}
        </ul>
      )}
    </Panel>
  );
}
