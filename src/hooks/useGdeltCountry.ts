import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { GdeltContextApiResponse } from "@/types";
import { useGlobalFilters } from "@/stores/useGlobalFilters";

import { commonQueryOptions, createAbortSignal } from "./utils";

export type UseGdeltCountryParams = {
  country?: string;
  dateStart?: string;
  dateEnd?: string;
};

export async function fetchGdeltCountry(
  params: Required<UseGdeltCountryParams>,
  fetchImpl: typeof fetch = fetch,
  abortSignal?: AbortSignal,
) {
  const searchParams = new URLSearchParams();
  searchParams.set("action", "country");
  searchParams.set("mode", "artlist");
  searchParams.set("format", "json");
  searchParams.set("country", params.country);
  searchParams.set("date_start", params.dateStart);
  searchParams.set("date_end", params.dateEnd);
  searchParams.set("time_unit", "day");

  const response = await fetchImpl(`/api/gdelt?${searchParams.toString()}`, {
    signal: createAbortSignal(abortSignal),
  });

  if (!response.ok) {
    if (response.status === 503) {
      return {} as GdeltContextApiResponse;
    }

    const message = await response.text();
    throw new Error(message || "GDELT unavailable");
  }

  return response.json() as Promise<GdeltContextApiResponse>;
}

export function useGdeltCountry(params: UseGdeltCountryParams) {
  const globalDateStart = useGlobalFilters((state) => state.dateStart);
  const globalDateEnd = useGlobalFilters((state) => state.dateEnd);

  const queryParams = useMemo(() => ({
    country: params.country ?? "",
    dateStart: params.dateStart ?? globalDateStart,
    dateEnd: params.dateEnd ?? globalDateEnd,
  }), [globalDateEnd, globalDateStart, params.country, params.dateEnd, params.dateStart]);

  const enabled = Boolean(queryParams.country && queryParams.dateStart && queryParams.dateEnd);

  return useQuery({
    queryKey: ["gdelt", "country", queryParams],
    queryFn: ({ signal }) =>
      fetchGdeltCountry(
        {
          country: queryParams.country,
          dateStart: queryParams.dateStart,
          dateEnd: queryParams.dateEnd,
        },
        fetch,
        signal,
      ),
    enabled,
    ...commonQueryOptions,
  });
}
