import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useGlobalFilters } from "@/stores/useGlobalFilters";

import { commonQueryOptions, createAbortSignal } from "./utils";

export type UseGdeltBilateralParams = {
  country1?: string;
  country2?: string;
  dateStart?: string;
  dateEnd?: string;
};

export async function fetchGdeltBilateral(
  params: Required<UseGdeltBilateralParams>,
  fetchImpl: typeof fetch = fetch,
  abortSignal?: AbortSignal,
) {
  const searchParams = new URLSearchParams();
  searchParams.set("action", "bilateral");
  searchParams.set("mode", "artlist");
  searchParams.set("format", "json");
  searchParams.set("country1", params.country1);
  searchParams.set("country2", params.country2);
  searchParams.set("date_start", params.dateStart);
  searchParams.set("date_end", params.dateEnd);
  searchParams.set("granularity", "daily");

  const response = await fetchImpl(`/api/gdelt?${searchParams.toString()}`, {
    signal: createAbortSignal(abortSignal),
  });

  if (!response.ok) {
    if (response.status === 503) {
      return {};
    }

    const message = await response.text();
    throw new Error(message || "GDELT unavailable");
  }

  return response.json();
}

export function useGdeltBilateral(params: UseGdeltBilateralParams) {
  const globalDateStart = useGlobalFilters((state) => state.dateStart);
  const globalDateEnd = useGlobalFilters((state) => state.dateEnd);

  const queryParams = useMemo(() => ({
    country1: params.country1 ?? "",
    country2: params.country2 ?? "",
    dateStart: params.dateStart ?? globalDateStart,
    dateEnd: params.dateEnd ?? globalDateEnd,
  }), [
    globalDateEnd,
    globalDateStart,
    params.country1,
    params.country2,
    params.dateEnd,
    params.dateStart,
  ]);

  const enabled =
    Boolean(queryParams.country1) &&
    Boolean(queryParams.country2) &&
    Boolean(queryParams.dateStart) &&
    Boolean(queryParams.dateEnd);

  return useQuery({
    queryKey: ["gdelt", "bilateral", queryParams],
    queryFn: ({ signal }) =>
      fetchGdeltBilateral(
        {
          country1: queryParams.country1,
          country2: queryParams.country2,
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
