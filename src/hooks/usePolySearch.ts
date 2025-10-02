import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useGlobalFilters } from "@/stores/useGlobalFilters";
import type { PolyMarket, PolyMarketApi, PolySearchApiResponse } from "@/types";

import { commonQueryOptions, createAbortSignal, normalizeMarket } from "./utils";

const shouldLog = process.env.NODE_ENV !== "production";

type PolySortOption = "volume24h" | "liquidity" | "endDate";

export type UsePolySearchParams = {
  q?: string;
  active?: boolean;
  limit?: number;
  category?: string;
  sort?: PolySortOption;
  enabled?: boolean;
};

export type PolySearchResult = {
  markets: PolyMarket[];
  [key: string]: unknown;
};

export async function fetchPolySearch(
  params: Pick<UsePolySearchParams, "q" | "active" | "limit" | "category" | "sort">,
  fetchImpl: typeof fetch = fetch,
  abortSignal?: AbortSignal,
): Promise<PolySearchResult> {
  const searchParams = new URLSearchParams();
  const trimmedQuery = params.q?.trim();
  if (trimmedQuery) {
    searchParams.set("q", trimmedQuery);
  }
  searchParams.set("active", String(params.active ?? true));
  searchParams.set("limit", String(params.limit ?? 30));
  if (params.category) {
    searchParams.set("category", params.category);
  }
  searchParams.set("sort", params.sort ?? "volume24h");

  const requestUrl = `/api/poly?${searchParams.toString()}`;

  if (shouldLog) {
    console.log("[hooks/usePolySearch] Fetching URL:", requestUrl, "params:", params);
  }

  const response = await fetchImpl(requestUrl, {
    signal: createAbortSignal(abortSignal),
  });

  if (!response.ok) {
    if (response.status === 503) {
      console.error("Service unavailable");
      throw new Error("Service unavailable");
    }

    const message = await response.text();
    throw new Error(message || "Failed to load Poly search results");
  }

  const data = (await response.json()) as PolySearchApiResponse;
  const rawMarkets: PolyMarketApi[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.markets)
    ? data.markets ?? []
    : Array.isArray(data?.data)
    ? data.data ?? []
    : [];

  const markets = rawMarkets.map((market) => normalizeMarket(market));

  const extraFields: Record<string, unknown> =
    data && !Array.isArray(data) ? (data as Record<string, unknown>) : {};

  return {
    ...extraFields,
    markets,
  };
}

export function usePolySearch(params: UsePolySearchParams) {
  const globalKeywords = useGlobalFilters((state) => state.keywords);

  const queryParams = useMemo(() => ({
    q: (() => {
      const keywordString = params.q ?? globalKeywords.join(" ");
      const trimmed = keywordString?.trim();
      return trimmed ? trimmed : undefined;
    })(),
    active: params.active ?? true,
    limit: params.limit ?? 30,
    category: params.category,
    sort: params.sort ?? "volume24h",
  }), [
    globalKeywords,
    params.active,
    params.category,
    params.limit,
    params.q,
    params.sort,
  ]);

  const enabled = params.enabled ?? true;

  return useQuery({
    queryKey: ["poly", "search", queryParams],
    queryFn: ({ signal }) =>
      fetchPolySearch(
        {
          q: queryParams.q,
          active: queryParams.active,
          limit: queryParams.limit,
          category: queryParams.category,
          sort: queryParams.sort,
        },
        fetch,
        signal,
      ),
    enabled,
    ...commonQueryOptions,
  });
}
