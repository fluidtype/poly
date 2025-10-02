"use client";

import { useCallback, useEffect } from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

import { SEARCH_SUBMIT_EVENT } from "@/components/search/events";
import SearchBar from "./SearchBar";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

const SEARCH_QUERY_PREFIXES = ["poly", "gdelt", "twitter"] as const;

export default function TopBar() {
  const queryClient = useQueryClient();
  const datasets = useGlobalFilters((state) => state.datasets);

  const activeFetches = useIsFetching({
    predicate: (query) => {
      const [prefix] = query.queryKey as [unknown];
      return typeof prefix === "string" && SEARCH_QUERY_PREFIXES.includes(prefix as (typeof SEARCH_QUERY_PREFIXES)[number]);
    },
  });

  const triggerRefetch = useCallback(() => {
    const prefixes: Array<(typeof SEARCH_QUERY_PREFIXES)[number]> = [];

    if (datasets.poly) {
      prefixes.push("poly");
    }

    if (datasets.gdelt) {
      prefixes.push("gdelt");
    }

    if (datasets.twitter) {
      prefixes.push("twitter");
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
    <div className="sticky top-16 z-40 border-b border-[color:var(--border)]/70 bg-[color:var(--panel)]/80 backdrop-blur-xl">
      <div className="relative">
        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-[color:var(--accent)]/50 via-transparent to-[color:var(--accent)]/50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_-10%,var(--glow-red),transparent_60%)]" />
        <div className="relative container-outer py-4">
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
