"use client";

import { useCallback, useEffect } from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

import { SEARCH_SUBMIT_EVENT } from "@/components/search/events";
import SearchBar from "./SearchBar";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

const SEARCH_QUERY_PREFIXES = ["polyMarkets", "gdeltContext", "twitterSearch"] as const;

export default function TopBar() {
  const queryClient = useQueryClient();
  const datasets = useGlobalFilters((state) => state.datasets);

  const activeFetches = useIsFetching({
    predicate: (query) => {
      const [prefix] = query.queryKey as [string | undefined];
      return prefix !== undefined && SEARCH_QUERY_PREFIXES.includes(prefix as typeof SEARCH_QUERY_PREFIXES[number]);
    },
  });

  const triggerRefetch = useCallback(() => {
    const prefixes: Array<(typeof SEARCH_QUERY_PREFIXES)[number]> = [];

    if (datasets.poly) {
      prefixes.push("polyMarkets");
    }

    if (datasets.gdelt) {
      prefixes.push("gdeltContext");
    }

    if (datasets.twitter) {
      prefixes.push("twitterSearch");
    }

    if (prefixes.length === 0) {
      return;
    }

    prefixes.forEach((prefix) => {
      queryClient.invalidateQueries({ queryKey: [prefix] });
      queryClient.refetchQueries({ queryKey: [prefix], type: "active" });
    });
  }, [datasets, queryClient]);

  const handleSearch = useCallback(() => {
    triggerRefetch();
  }, [triggerRefetch]);

  useEffect(() => {
    const listener = () => {
      triggerRefetch();
    };

    window.addEventListener(SEARCH_SUBMIT_EVENT, listener);
    return () => window.removeEventListener(SEARCH_SUBMIT_EVENT, listener);
  }, [triggerRefetch]);

  return (
    <div className="sticky top-[var(--header-h)] z-40 border-b border-[color:var(--border)]/60 bg-[color:var(--surface)]/85 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="relative">
        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-[color:var(--primary)]/35 via-transparent to-[color:var(--primary)]/35" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_-10%,rgba(224,36,36,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-4">
          <SearchBar
            loading={activeFetches > 0}
            error={null}
            onRetry={() => triggerRefetch()}
            onSearch={handleSearch}
          />
        </div>
      </div>
    </div>
  );
}
