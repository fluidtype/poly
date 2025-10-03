"use client";

import { useCallback, useEffect } from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

import { SearchInput } from "@/components/search/SearchInput";
import { ActiveRangeLabel } from "@/components/search/ActiveRangeLabel";
import { DatePresets } from "@/components/search/DatePresets";
import { DatasetToggles } from "@/components/search/DatasetToggles";
import { AdvancedButton } from "@/components/search/AdvancedButton";
import { SEARCH_SUBMIT_EVENT } from "@/components/search/events";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

const SEARCH_QUERY_PREFIXES = ["poly", "gdelt", "twitter"] as const;

export function TopBar() {
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

  const loading = activeFetches > 0;

  return (
    <div
      className="
        sticky top-[var(--header-h)] z-40 relative
        bg-[rgb(var(--surface))]/85 backdrop-blur-md
        border-b border-[rgb(var(--borderc))]/60 shadow-[0_10px_30px_rgba(0,0,0,0.35)]
      "
    >
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-[rgb(var(--brand))]/35 via-transparent to-[rgb(var(--brand))]/35" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_-10%,rgba(224,36,36,0.12),transparent_60%)]" />

      <div className="mx-auto max-w-[1440px] px-5 py-4 relative">
        <div className="mx-auto w-full max-w-[760px]">
          <SearchInput loading={loading} onSearch={handleSearch} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <ActiveRangeLabel />
            <DatePresets disabled={loading} />
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <DatasetToggles disabled={loading} />
            <AdvancedButton />
          </div>
        </div>

        <div className="pointer-events-none mt-1 h-[2px] rounded-full bg-[radial-gradient(60%_80%_at_50%_50%,rgba(224,36,36,0.45),transparent)]" />
      </div>
    </div>
  );
}

export default TopBar;
