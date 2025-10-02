import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useGlobalFilters } from "@/stores/useGlobalFilters";
import type {
  GdeltContextApiItem,
  GdeltContextApiResponse,
  GdeltEvent,
  GdeltInsights,
  GdeltSeriesPoint,
} from "@/types";

import { commonQueryOptions, createAbortSignal, normalizeGdeltDate } from "./utils";

export type GdeltContextResult = {
  series: GdeltSeriesPoint[];
  events: GdeltEvent[];
  insights: GdeltInsights;
};

export type UseGdeltContextParams = {
  keywords?: string[];
  dateStart?: string;
  dateEnd?: string;
  limit?: number;
  includeInsights?: boolean;
};

const defaultMockContext: GdeltContextResult = {
  series: [
    {
      date: "2025-10-01",
      conflict_events: 100,
    },
  ],
  events: [],
  insights: {},
};

export async function fetchGdeltContextData(
  params: Required<Pick<UseGdeltContextParams, "keywords" | "dateStart" | "dateEnd">> &
    Pick<UseGdeltContextParams, "limit" | "includeInsights">,
  fetchImpl: typeof fetch = fetch,
  abortSignal?: AbortSignal,
): Promise<GdeltContextResult> {
  const searchParams = new URLSearchParams();
  searchParams.set("action", "context");
  searchParams.set("mode", "artlist");
  searchParams.set("format", "json");
  searchParams.set("keywords", params.keywords.join(","));
  searchParams.set("date_start", params.dateStart);
  searchParams.set("date_end", params.dateEnd);
  searchParams.set("include_insights", String(params.includeInsights ?? true));
  searchParams.set("limit", String(params.limit ?? 500));

  const response = await fetchImpl(`/api/gdelt?${searchParams.toString()}`, {
    signal: createAbortSignal(abortSignal),
  });

  if (!response.ok) {
    if (response.status === 503) {
      console.error("Service unavailable");
      return defaultMockContext;
    }

    let message = "GDELT error";
    try {
      const errorBody = (await response.json()) as GdeltContextApiResponse;
      if (errorBody?.message) {
        message = errorBody.message;
      } else if (typeof errorBody?.status === "string") {
        message = errorBody.status;
      }
    } catch (parseError) {
      console.error("Failed to parse GDELT context error response", parseError);
      const fallbackMessage = await response.text().catch(() => "");
      if (fallbackMessage) {
        message = fallbackMessage;
      }
    }

    throw new Error(message);
  }

  const data = (await response.json()) as GdeltContextApiResponse;
  const items: GdeltContextApiItem[] = Array.isArray(data?.data) ? data.data : [];

  const series: GdeltSeriesPoint[] = items.map((item) => ({
    date: normalizeGdeltDate(item?.DayDate ?? item?.SQLDATE ?? item?.date),
    conflict_events: typeof item?.conflict_events === "number" ? item.conflict_events : undefined,
    avg_sentiment: typeof item?.avg_sentiment === "number" ? item.avg_sentiment : undefined,
    avg_impact: typeof item?.avg_impact === "number" ? item.avg_impact : undefined,
    interaction_count: typeof item?.interaction_count === "number" ? item.interaction_count : undefined,
    relative_coverage: typeof item?.relative_coverage === "number" ? item.relative_coverage : undefined,
  }));

  const events: GdeltEvent[] = items.map((item) => ({
    SQLDATE: item?.SQLDATE ?? item?.DayDate ?? "",
    SOURCEURL: item?.SOURCEURL ?? "",
    Actor1CountryCode: item?.Actor1CountryCode,
    EventCode: item?.EventCode,
    AvgTone: typeof item?.AvgTone === "number" ? item.AvgTone : undefined,
    ...item,
  }));

  const insights: GdeltInsights = (data?.insights ?? {}) as GdeltInsights;

  return {
    series,
    events,
    insights,
  };
}

export function useGdeltContext(params: UseGdeltContextParams = {}) {
  const globalKeywords = useGlobalFilters((state) => state.keywords);
  const globalDateStart = useGlobalFilters((state) => state.dateStart);
  const globalDateEnd = useGlobalFilters((state) => state.dateEnd);

  const queryParams = useMemo(() => {
    const keywords = params.keywords?.length ? params.keywords : globalKeywords;
    const dateStart = params.dateStart ?? globalDateStart;
    const dateEnd = params.dateEnd ?? globalDateEnd;

    return {
      keywords,
      dateStart,
      dateEnd,
      limit: params.limit ?? 500,
      includeInsights: params.includeInsights ?? true,
    };
  }, [
    globalDateEnd,
    globalDateStart,
    globalKeywords,
    params.dateEnd,
    params.dateStart,
    params.includeInsights,
    params.keywords,
    params.limit,
  ]);

  return useQuery({
    queryKey: ["gdelt", "context", queryParams],
    queryFn: ({ signal }) =>
      fetchGdeltContextData(
        {
          keywords: queryParams.keywords,
          dateStart: queryParams.dateStart,
          dateEnd: queryParams.dateEnd,
          limit: queryParams.limit,
          includeInsights: queryParams.includeInsights,
        },
        fetch,
        signal,
      ),
    enabled:
      Array.isArray(queryParams.keywords) &&
      queryParams.keywords.length > 0 &&
      Boolean(queryParams.dateStart) &&
      Boolean(queryParams.dateEnd),
    ...commonQueryOptions,
  });
}
