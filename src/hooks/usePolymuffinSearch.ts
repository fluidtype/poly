import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useGlobalFilters } from "@/stores/useGlobalFilters";
import type {
  PolymuffinMarket,
  PolymuffinMarketApi,
  PolymuffinSearchApiResponse,
} from "@/types";

import { commonQueryOptions, createAbortSignal, normalizeMarket } from "./utils";

const shouldLog = process.env.NODE_ENV !== "production";

type PolymuffinSortOption = "volume24h" | "liquidity" | "endDate";

export type UsePolymuffinSearchParams = {
  q?: string;
  active?: boolean;
  limit?: number;
  category?: string;
  sort?: PolymuffinSortOption;
  enabled?: boolean;
};

export type PolymuffinSearchResult = {
  markets: PolymuffinMarket[];
  [key: string]: unknown;
};

export async function fetchPolymuffinSearch(
  params: Pick<UsePolymuffinSearchParams, "q" | "active" | "limit" | "category" | "sort">,
  fetchImpl: typeof fetch = fetch,
  abortSignal?: AbortSignal,
): Promise<PolymuffinSearchResult> {
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

  const requestUrl = `/api/polymuffin?${searchParams.toString()}`;

  if (shouldLog) {
    console.log(
      "[hooks/usePolymuffinSearch] Fetching URL:",
      requestUrl,
      "params:",
      params,
    );
  }

  const response = await fetchImpl(requestUrl, {
    signal: createAbortSignal(abortSignal),
  });

  if (!response.ok) {
    if (response.status === 503) {
      console.error("Service unavailable");
      throw new Error("Service unavailable");
    }

    let errorMessage: string | undefined;

    try {
      const errorJson = await response.clone().json();
      if (typeof errorJson === "string") {
        errorMessage = errorJson;
      } else if (
        errorJson &&
        typeof errorJson === "object" &&
        typeof (errorJson as { message?: unknown }).message === "string"
      ) {
        errorMessage = (errorJson as { message: string }).message;
      }
    } catch {
      const fallbackMessage = await response.text();
      errorMessage = fallbackMessage || undefined;
    }

    throw new Error(errorMessage || "Failed to load Polymuffin search results");
  }

  const data = (await response.json()) as PolymuffinSearchApiResponse;
  const rawMarkets: PolymuffinMarketApi[] = Array.isArray(data)
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

export function usePolymuffinSearch(params: UsePolymuffinSearchParams) {
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
    queryKey: ["polymuffin", "search", queryParams],
    queryFn: ({ signal }) =>
      fetchPolymuffinSearch(
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
