import { useQuery } from "@tanstack/react-query";

import type { PolymuffinMarket } from "@/types";

import { commonQueryOptions, createAbortSignal, normalizeMarket } from "./utils";

export type UsePolymuffinMarketDetailsParams = {
  id?: string;
};

export type PolymuffinMarketDetailsResult = {
  market: PolymuffinMarket | null;
  [key: string]: unknown;
};

export async function fetchPolymuffinMarketDetails(
  params: Required<UsePolymuffinMarketDetailsParams>,
  fetchImpl: typeof fetch = fetch,
  abortSignal?: AbortSignal,
): Promise<PolymuffinMarketDetailsResult> {
  const response = await fetchImpl(`/api/polymuffin/market?id=${params.id}`, {
    signal: createAbortSignal(abortSignal),
  });

  if (!response.ok) {
    if (response.status === 503) {
      console.error("Service unavailable");
      throw new Error("Service unavailable");
    }

    const message = await response.text();
    throw new Error(message || "Failed to load Polymuffin market details");
  }

  const data = await response.json();
  const marketData = data?.market ?? data;

  return {
    ...data,
    market: marketData ? normalizeMarket(marketData) : null,
  };
}

export function usePolymuffinMarketDetails(params: UsePolymuffinMarketDetailsParams) {
  return useQuery({
    queryKey: ["polymuffin", "market", params?.id],
    queryFn: ({ signal }) => {
      if (!params?.id) {
        throw new Error("Market id is required");
      }

      return fetchPolymuffinMarketDetails(
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
