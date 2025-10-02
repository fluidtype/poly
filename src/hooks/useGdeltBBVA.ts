import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useGlobalFilters } from "@/stores/useGlobalFilters";

import { commonQueryOptions, createAbortSignal } from "./utils";

export type UseGdeltBBVAParams = {
  actor1?: string;
  actor2?: string;
  dateStart?: string;
  dateEnd?: string;
  includeTotal?: boolean;
  cameoCodes?: string;
};

export async function fetchGdeltBBVA(
  params: Required<Pick<UseGdeltBBVAParams, "actor1" | "actor2" | "dateStart" | "dateEnd">> &
    Pick<UseGdeltBBVAParams, "includeTotal" | "cameoCodes">,
  fetchImpl: typeof fetch = fetch,
  abortSignal?: AbortSignal,
) {
  const searchParams = new URLSearchParams();
  searchParams.set("action", "bilateral_conflict_coverage");
  searchParams.set("mode", "artlist");
  searchParams.set("format", "json");
  searchParams.set("actor1_code", params.actor1);
  searchParams.set("actor2_code", params.actor2);
  searchParams.set("date_start", params.dateStart);
  searchParams.set("date_end", params.dateEnd);
  searchParams.set("include_total", String(params.includeTotal ?? false));
  if (params.cameoCodes) {
    searchParams.set("cameo_codes", params.cameoCodes);
  }

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

export function useGdeltBBVA(params: UseGdeltBBVAParams) {
  const globalDateStart = useGlobalFilters((state) => state.dateStart);
  const globalDateEnd = useGlobalFilters((state) => state.dateEnd);

  const queryParams = useMemo(() => ({
    actor1: params.actor1 ?? "",
    actor2: params.actor2 ?? "",
    dateStart: params.dateStart ?? globalDateStart,
    dateEnd: params.dateEnd ?? globalDateEnd,
    includeTotal: params.includeTotal ?? false,
    cameoCodes: params.cameoCodes,
  }), [
    globalDateEnd,
    globalDateStart,
    params.actor1,
    params.actor2,
    params.cameoCodes,
    params.dateEnd,
    params.dateStart,
    params.includeTotal,
  ]);

  const enabled =
    Boolean(queryParams.actor1) &&
    Boolean(queryParams.actor2) &&
    Boolean(queryParams.dateStart) &&
    Boolean(queryParams.dateEnd);

  return useQuery({
    queryKey: ["gdelt", "bbva", queryParams],
    queryFn: ({ signal }) =>
      fetchGdeltBBVA(
        {
          actor1: queryParams.actor1,
          actor2: queryParams.actor2,
          dateStart: queryParams.dateStart,
          dateEnd: queryParams.dateEnd,
          includeTotal: queryParams.includeTotal,
          cameoCodes: queryParams.cameoCodes,
        },
        fetch,
        signal,
      ),
    enabled,
    ...commonQueryOptions,
  });
}
