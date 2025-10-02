"use client";

import { useCallback } from "react";

import { SEARCH_SUBMIT_EVENT } from "@/components/search/events";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

const datasetLabels: Record<"gdelt" | "poly" | "twitter", string> = {
  gdelt: "GDELT",
  poly: "Polymarket",
  twitter: "Twitter",
};

function dispatchSearchEvent(keywords: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(SEARCH_SUBMIT_EVENT, {
      detail: { keywords },
    })
  );
}

export default function SearchStatePanel() {
  const keywords = useGlobalFilters((state) => state.keywords);
  const dateStart = useGlobalFilters((state) => state.dateStart);
  const dateEnd = useGlobalFilters((state) => state.dateEnd);
  const activePreset = useGlobalFilters((state) => state.activePreset);
  const datasets = useGlobalFilters((state) => state.datasets);
  const setKeywords = useGlobalFilters((state) => state.setKeywords);

  const handleClear = useCallback(() => {
    setKeywords([]);
    dispatchSearchEvent([]);
  }, [setKeywords]);

  const activeDatasets = Object.entries(datasets)
    .filter(([, enabled]) => enabled)
    .map(([key]) => datasetLabels[key as keyof typeof datasetLabels])
    .filter(Boolean);

  return (
    <section className="card md:col-span-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Active filters</h2>
          <p className="text-sm text-[rgb(var(--muted))]">
            Monitor search state and tweak datasets while exploring the dashboard.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={keywords.length === 0}
          className="rounded-full border border-[rgb(var(--borderc))]/80 px-4 py-1 text-xs uppercase tracking-wide text-[rgb(var(--muted))] transition hover:border-[rgb(var(--primary))]/45 hover:text-[rgb(var(--text))] disabled:cursor-not-allowed disabled:border-[rgb(var(--borderc))]/40 disabled:text-[rgb(var(--muted))]/60"
        >
          Clear search
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[rgb(var(--borderc))]/70 bg-[rgb(var(--surface2))]/60 p-4">
          <h3 className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">Keywords</h3>
          {keywords.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-[rgb(var(--primary))]/40 bg-[rgb(var(--primary))]/15 px-3 py-1 text-sm text-[rgb(var(--text))]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">No keywords applied.</p>
          )}
        </div>

        <div className="rounded-2xl border border-[rgb(var(--borderc))]/70 bg-[rgb(var(--surface2))]/60 p-4">
          <h3 className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">Date range</h3>
          <p className="mt-2 text-sm text-[rgb(var(--text))]">
            {dateStart} → {dateEnd}
          </p>
          <p className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">Preset: {activePreset}</p>
        </div>

        <div className="rounded-2xl border border-[rgb(var(--borderc))]/70 bg-[rgb(var(--surface2))]/60 p-4">
          <h3 className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">Datasets</h3>
          {activeDatasets.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {activeDatasets.map((dataset) => (
                <span
                  key={dataset}
                  className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-sm text-[rgb(var(--text))]"
                >
                  {dataset}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[rgb(var(--muted))]">All datasets disabled.</p>
          )}
        </div>
      </div>
    </section>
  );
}
