import { useQuery } from "@tanstack/react-query";

import type { PolyMarket } from "@/types";

import { commonQueryOptions, createAbortSignal, normalizeMarket } from "./utils";

export type UsePolyMarketDetailsParams = {
  id?: string;
};

export type PolyMarketDetailsResult = {
  market: PolyMarket | null;
  [key: string]: unknown;
};

export async function fetchPolyMarketDetails(
  params: Required<UsePolyMarketDetailsParams>,
  fetchImpl: typeof fetch = fetch,
  abortSignal?: AbortSignal,
): Promise<PolyMarketDetailsResult> {
  const response = await fetchImpl(`/api/poly/market?id=${params.id}`, {
    signal: createAbortSignal(abortSignal),
  });

  if (!response.ok) {
    if (response.status === 503) {
      console.error("Service unavailable");
      throw new Error("Service unavailable");
    }

    const message = await response.text();
    throw new Error(message || "Failed to load Poly market details");
  }

  const data = await response.json();
  const marketData = data?.market ?? data;

  return {
    ...data,
    market: marketData ? normalizeMarket(marketData) : null,
  };
}

export function usePolyMarketDetails(params: UsePolyMarketDetailsParams) {
  return useQuery({
    queryKey: ["poly", "market", params?.id],
    queryFn: ({ signal }) => {
      if (!params?.id) {
        throw new Error("Market id is required");
      }

      return fetchPolyMarketDetails(
        {
          id: params.id,
        },
        fetch,
        signal,
      );
    },
    enabled: Boolean(params?.id),
    ...commonQueryOptions,
  });
}
