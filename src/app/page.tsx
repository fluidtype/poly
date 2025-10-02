'use client';

import { useMemo, useState, type ComponentProps } from "react";

import { GdeltChart } from "@/components/gdelt/GdeltChart";
import { GdeltEventsList } from "@/components/gdelt/GdeltEventsList";
import { InsightsPanel } from "@/components/gdelt/InsightsPanel";
import { KpiCards } from "@/components/gdelt/KpiCards";
import { PolyMarketGrid } from "@/components/poly/PolyMarketGrid";
import ActivityPanel from "@/components/system/ActivityPanel";
import { TwitterPlaceholder } from "@/components/twitter/TwitterPlaceholder";
import { useGdeltBBVA } from "@/hooks/useGdeltBBVA";
import { useGdeltBilateral } from "@/hooks/useGdeltBilateral";
import { useGdeltContext } from "@/hooks/useGdeltContext";
import { useGdeltCountry } from "@/hooks/useGdeltCountry";
import { usePolySearch } from "@/hooks/usePolySearch";
import { normalizeGdeltDate } from "@/hooks/utils";
import { useGlobalFilters } from "@/stores/useGlobalFilters";
import { useGdeltMode } from "@/stores/useGdeltMode";
import { useSidePanel } from "@/stores/useSidePanel";
import type { GdeltEvent, GdeltInsights, GdeltSeriesPoint } from "@/types";

type ActivityPanelProps = ComponentProps<typeof ActivityPanel>;
type DatasetStatusEntry = NonNullable<ActivityPanelProps["datasets"]>[number];
type RecentQueryEntry = NonNullable<ActivityPanelProps["recentQueries"]>[number];

type Aggregation = "daily" | "monthly";

interface ActiveGdeltData {
  series: GdeltSeriesPoint[];
  events: GdeltEvent[];
  insights?: GdeltInsights;
  aggregation: Aggregation;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toRecordArray = (value: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is Record<string, unknown> => isRecord(item));
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const extractGdeltItems = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) {
    return toRecordArray(payload);
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return toRecordArray(payload.data);
  }

  if (Array.isArray(payload.results)) {
    return toRecordArray(payload.results);
  }

  if (Array.isArray(payload.series)) {
    return toRecordArray(payload.series);
  }

  if (Array.isArray(payload.events)) {
    return toRecordArray(payload.events);
  }

  return [];
};

const toSeriesPoint = (record: Record<string, unknown>): GdeltSeriesPoint => {
  const dateCandidate =
    record.DayDate ?? record.SQLDATE ?? record.date ?? record.day ?? record.timestamp ?? "";

  const point: GdeltSeriesPoint = {
    date: normalizeGdeltDate(dateCandidate),
  };

  const conflictCandidate =
    record.conflict_events ?? record.total_events ?? record.count ?? record.value;
  const sentimentCandidate =
    record.avg_sentiment ?? record.average_sentiment ?? record.sentiment ?? record.avgTone;
  const impactCandidate = record.avg_impact ?? record.average_impact ?? record.impact;
  const interactionCandidate =
    record.interaction_count ?? record.interactions ?? record.total_interactions;
  const coverageCandidate =
    record.relative_coverage ?? record.coverage ?? record.relative ?? record.relativeCoverage;

  const conflictEvents = toNumber(conflictCandidate);
  const avgSentiment = toNumber(sentimentCandidate);
  const avgImpact = toNumber(impactCandidate);
  const interactionCount = toNumber(interactionCandidate);
  const relativeCoverage = toNumber(coverageCandidate);

  if (conflictEvents !== undefined) {
    point.conflict_events = conflictEvents;
  }

  if (avgSentiment !== undefined) {
    point.avg_sentiment = avgSentiment;
  }

  if (avgImpact !== undefined) {
    point.avg_impact = avgImpact;
  }

  if (interactionCount !== undefined) {
    point.interaction_count = interactionCount;
  }

  if (relativeCoverage !== undefined) {
    point.relative_coverage = relativeCoverage;
  }

  return point;
};

const toEvent = (record: Record<string, unknown>): GdeltEvent => {
  const base: GdeltEvent = {
    ...record,
    SQLDATE: (record.SQLDATE ?? record.DayDate ?? record.date ?? "") as string | number,
    SOURCEURL: typeof record.SOURCEURL === "string" ? record.SOURCEURL : "",
    Actor1CountryCode:
      typeof record.Actor1CountryCode === "string" ? record.Actor1CountryCode : undefined,
    Actor2CountryCode:
      typeof record.Actor2CountryCode === "string" ? record.Actor2CountryCode : undefined,
    EventCode: typeof record.EventCode === "string" ? record.EventCode : undefined,
    AvgTone: toNumber(record.AvgTone),
  };

  return base;
};

const average = (values: Array<number | undefined>): number | undefined => {
  const filtered = values.filter((value): value is number => typeof value === "number");
  if (filtered.length === 0) {
    return undefined;
  }
  const total = filtered.reduce((sum, value) => sum + value, 0);
  return total / filtered.length;
};

const topPairFromInsights = (insights?: GdeltInsights): string | undefined => {
  if (!insights) {
    return undefined;
  }

  const record = insights as Record<string, unknown>;

  const direct = record.top_pair;
  if (typeof direct === "string") {
    return direct;
  }

  const pairsCandidate = record.top_pairs ?? record.actor_pairs ?? record.leading_pairs;
  if (Array.isArray(pairsCandidate)) {
    const first = pairsCandidate[0];
    if (typeof first === "string") {
      return first;
    }
    if (isRecord(first)) {
      const label =
        typeof first.label === "string"
          ? first.label
          : typeof first.pair === "string"
          ? first.pair
          : typeof first.name === "string"
          ? first.name
          : undefined;
      if (label) {
        return label;
      }
    }
  }

  return undefined;
};

const toIsoString = (timestamp?: number): string | undefined => {
  if (!timestamp) {
    return undefined;
  }

  if (timestamp <= 0) {
    return undefined;
  }

  return new Date(timestamp).toISOString();
};

const DisabledDatasetCard = ({ title, description }: { title: string; description: string }) => (
  <div className="card flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--border)]/70 bg-[color:var(--card)]/70 p-6 text-center">
    <h3 className="text-base font-semibold text-[color:var(--fg)]">{title}</h3>
    <p className="mt-2 text-sm text-[color:var(--muted)]">{description}</p>
  </div>
);

interface QueryState {
  dataUpdatedAt: number;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
}

export default function HomePage() {
  const keywords = useGlobalFilters((state) => state.keywords);
  const dateStart = useGlobalFilters((state) => state.dateStart);
  const dateEnd = useGlobalFilters((state) => state.dateEnd);
  const datasets = useGlobalFilters((state) => state.datasets);
  const mode = useGdeltMode((state) => state.mode);
  const modeParams = useGdeltMode((state) => state.params);
  const openPanel = useSidePanel((state) => state.openPanel);

  const [activeDate, setActiveDate] = useState<string | null>(null);

  const contextParams = modeParams.context ?? { includeInsights: true, limit: 500 };
  const countryParams = modeParams.country ?? { country: "" };
  const bilateralParams = modeParams.bilateral ?? { country1: "", country2: "" };
  const bbvaParams =
    modeParams.bbva ?? ({ actor1: "", actor2: "", includeTotal: false } as const);

  const contextQuery = useGdeltContext(
    mode === "context" && datasets.gdelt
      ? {
          includeInsights: contextParams.includeInsights,
          limit: contextParams.limit,
        }
      : {
          dateStart: "",
          dateEnd: "",
        },
  );

  const countryQuery = useGdeltCountry(
    mode === "country" && datasets.gdelt
      ? {
          country: countryParams.country,
          dateStart,
          dateEnd,
        }
      : {
          country: "",
          dateStart: "",
          dateEnd: "",
        },
  );

  const bilateralQuery = useGdeltBilateral(
    mode === "bilateral" && datasets.gdelt
      ? {
          country1: bilateralParams.country1,
          country2: bilateralParams.country2,
          dateStart,
          dateEnd,
        }
      : {
          country1: "",
          country2: "",
          dateStart: "",
          dateEnd: "",
        },
  );

  const bbvaQuery = useGdeltBBVA(
    mode === "bbva" && datasets.gdelt
      ? {
          actor1: bbvaParams.actor1,
          actor2: bbvaParams.actor2,
          dateStart,
          dateEnd,
          includeTotal: bbvaParams.includeTotal,
          cameoCodes: bbvaParams.cameoCodes,
        }
      : {
          actor1: "",
          actor2: "",
          dateStart: "",
          dateEnd: "",
        },
  );

  const polyQuery = usePolySearch(
    datasets.poly
      ? {
          q: keywords.length > 0 ? keywords.join(" ") : undefined,
          active: true,
          sort: "volume24h",
        }
      : { enabled: false },
  );

  const activeGdeltState: QueryState = (() => {
    if (!datasets.gdelt) {
      return { dataUpdatedAt: 0, isError: false, isLoading: false, isFetching: false, error: null };
    }

    switch (mode) {
      case "country":
        return {
          dataUpdatedAt: countryQuery.dataUpdatedAt,
          isError: countryQuery.isError,
          isLoading: countryQuery.isLoading,
          isFetching: countryQuery.isFetching,
          error: countryQuery.error,
        };
      case "bilateral":
        return {
          dataUpdatedAt: bilateralQuery.dataUpdatedAt,
          isError: bilateralQuery.isError,
          isLoading: bilateralQuery.isLoading,
          isFetching: bilateralQuery.isFetching,
          error: bilateralQuery.error,
        };
      case "bbva":
        return {
          dataUpdatedAt: bbvaQuery.dataUpdatedAt,
          isError: bbvaQuery.isError,
          isLoading: bbvaQuery.isLoading,
          isFetching: bbvaQuery.isFetching,
          error: bbvaQuery.error,
        };
      default:
        return {
          dataUpdatedAt: contextQuery.dataUpdatedAt,
          isError: contextQuery.isError,
          isLoading: contextQuery.isLoading,
          isFetching: contextQuery.isFetching,
          error: contextQuery.error,
        };
    }
  })();

  const activeGdeltData = useMemo<ActiveGdeltData>(() => {
    if (!datasets.gdelt) {
      return { series: [], events: [], aggregation: "daily" };
    }

    if (mode === "context") {
      return {
        series: contextQuery.data?.series ?? [],
        events: contextQuery.data?.events ?? [],
        insights: contextQuery.data?.insights,
        aggregation: "daily",
      };
    }

    const rawData =
      mode === "country"
        ? countryQuery.data
        : mode === "bilateral"
        ? bilateralQuery.data
        : bbvaQuery.data;

    const items = extractGdeltItems(rawData);
    const series = items.map(toSeriesPoint);
    const events = items.map(toEvent);

    let insights: GdeltInsights | undefined;
    let aggregation: Aggregation = "daily";

    if (isRecord(rawData)) {
      const rawInsights = rawData["insights"];
      if (rawInsights && typeof rawInsights === "object") {
        insights = rawInsights as GdeltInsights;
      }

      const aggregationCandidate =
        rawData["aggregation"] ?? rawData["granularity"] ?? rawData["time_unit"];
      if (
        typeof aggregationCandidate === "string" &&
        aggregationCandidate.toLowerCase().includes("month")
      ) {
        aggregation = "monthly";
      }
    }

    return { series, events, insights, aggregation };
  }, [
    datasets.gdelt,
    mode,
    contextQuery.data,
    countryQuery.data,
    bilateralQuery.data,
    bbvaQuery.data,
  ]);

  const gdeltSeries = activeGdeltData.series;
  const gdeltEvents = activeGdeltData.events;
  const gdeltInsights = activeGdeltData.insights;
  const gdeltAggregation = activeGdeltData.aggregation;

  const gdeltLoading =
    datasets.gdelt && (activeGdeltState.isLoading || activeGdeltState.isFetching);
  const gdeltError =
    datasets.gdelt && activeGdeltState.isError
      ? activeGdeltState.error instanceof Error
        ? activeGdeltState.error.message
        : "Unknown error"
      : null;

  const markets = datasets.poly ? polyQuery.data?.markets ?? [] : [];
  const polyLoading = datasets.poly && (polyQuery.isLoading || polyQuery.isFetching);
  const polyError =
    datasets.poly && polyQuery.isError
      ? polyQuery.error instanceof Error
        ? polyQuery.error.message
        : "Unknown error"
      : null;

  const twitterIntegrationEnabled = process.env.NEXT_PUBLIC_ENABLE_TWITTER === "1";
  const comingSoon = !datasets.twitter || !twitterIntegrationEnabled;

  const kpiValues = useMemo(
    () => {
      if (!datasets.gdelt) {
        return {
          totalEvents: undefined,
          avgTone: undefined,
          avgImpact: undefined,
          topPair: undefined,
        };
      }

      const totalEventsFromInsights =
        typeof gdeltInsights?.total_events === "number" ? gdeltInsights.total_events : undefined;
      const totalEventsFromSeries = gdeltSeries.reduce(
        (sum, point) => sum + (point.conflict_events ?? 0),
        0,
      );
      const totalEvents =
        totalEventsFromInsights ?? (totalEventsFromSeries > 0 ? totalEventsFromSeries : undefined);

      const avgToneFromInsights =
        gdeltInsights &&
        typeof gdeltInsights.sentiment_analysis === "object" &&
        gdeltInsights.sentiment_analysis !== null &&
        typeof gdeltInsights.sentiment_analysis.avg_tone === "number"
          ? gdeltInsights.sentiment_analysis.avg_tone
          : undefined;

      const avgTone = avgToneFromInsights ?? average(gdeltSeries.map((point) => point.avg_sentiment));
      const avgImpact = average(gdeltSeries.map((point) => point.avg_impact));
      const topPair = topPairFromInsights(gdeltInsights);

      return { totalEvents, avgTone, avgImpact, topPair };
    },
    [datasets.gdelt, gdeltInsights, gdeltSeries],
  );

  const datasetStatuses = useMemo<DatasetStatusEntry[]>(
    () => [
      {
        id: "gdelt",
        label: "GDELT",
        lastFetched: toIsoString(activeGdeltState.dataUpdatedAt),
        status: !datasets.gdelt
          ? "red"
          : gdeltError
          ? "red"
          : activeGdeltState.isFetching
          ? "yellow"
          : "green",
        fallback: gdeltAggregation === "monthly" ? "Monthly aggregation fallback" : null,
        enabled: datasets.gdelt,
      },
      {
        id: "poly",
        label: "Polymarket",
        lastFetched: toIsoString(polyQuery.dataUpdatedAt),
        status: !datasets.poly
          ? "red"
          : polyError
          ? "red"
          : polyQuery.isFetching
          ? "yellow"
          : "green",
        fallback: null,
        enabled: datasets.poly,
      },
      {
        id: "twitter",
        label: "Twitter",
        lastFetched: undefined,
        status: !datasets.twitter
          ? "red"
          : !twitterIntegrationEnabled
          ? "yellow"
          : "green",
        fallback: !twitterIntegrationEnabled ? "Awaiting integration" : null,
        enabled: datasets.twitter,
      },
    ],
    [
      activeGdeltState.dataUpdatedAt,
      activeGdeltState.isFetching,
      datasets.gdelt,
      datasets.poly,
      datasets.twitter,
      gdeltAggregation,
      gdeltError,
      polyError,
      polyQuery.dataUpdatedAt,
      polyQuery.isFetching,
      twitterIntegrationEnabled,
    ],
  );

  const recentQueries = useMemo<RecentQueryEntry[]>(
    () => {
      const entries: RecentQueryEntry[] = [];
      if (keywords.length === 0) {
        return entries;
      }

      if (datasets.gdelt) {
        entries.push({
          query: keywords.join(", "),
          timestamp: toIsoString(activeGdeltState.dataUpdatedAt) ?? new Date().toISOString(),
          dataset: `GDELT (${mode.toUpperCase()})`,
        });
      }

      if (datasets.poly) {
        entries.push({
          query: keywords.join(" "),
          timestamp: toIsoString(polyQuery.dataUpdatedAt) ?? new Date().toISOString(),
          dataset: "Polymarket",
        });
      }

      return entries;
    },
    [
      activeGdeltState.dataUpdatedAt,
      datasets.gdelt,
      datasets.poly,
      keywords,
      mode,
      polyQuery.dataUpdatedAt,
    ],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="grid flex-1 min-h-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] xl:grid-cols-[minmax(0,8fr)_minmax(0,5fr)]">
        <div className="grid min-h-0 grid-rows-[minmax(0,3fr)_minmax(0,2fr)] gap-6">
          <section className="flex min-h-0 flex-col">
            {datasets.gdelt ? (
              <GdeltChart
                series={gdeltSeries}
                aggregation={gdeltAggregation}
                onDateClick={(iso) => setActiveDate(iso)}
                isLoading={gdeltLoading}
                error={gdeltError}
              />
            ) : (
              <DisabledDatasetCard
                title="GDELT dataset disabled"
                description="Enable the GDELT dataset from the filters to explore temporal activity."
              />
            )}
          </section>

          <section className="flex min-h-0 flex-col">
            {datasets.gdelt ? (
              <GdeltEventsList
                events={gdeltEvents}
                activeDate={activeDate ?? undefined}
                onOpen={(event) =>
                  openPanel("event", {
                    json: event,
                    title: typeof event.SOURCEURL === "string" ? event.SOURCEURL : "Event details",
                    url: typeof event.SOURCEURL === "string" ? event.SOURCEURL : undefined,
                  })
                }
                isLoading={gdeltLoading}
                error={gdeltError}
              />
            ) : (
              <DisabledDatasetCard
                title="Events hidden"
                description="Activate the GDELT stream to review the underlying source events."
              />
            )}
          </section>
        </div>

        <div className="flex min-h-0 flex-col gap-6">
          <div>
            {datasets.gdelt ? (
              <KpiCards
                totalEvents={kpiValues.totalEvents}
                avgTone={kpiValues.avgTone}
                avgImpact={kpiValues.avgImpact}
                topPair={kpiValues.topPair ?? undefined}
                isLoading={gdeltLoading}
                error={gdeltError}
              />
            ) : (
              <DisabledDatasetCard
                title="KPIs unavailable"
                description="Turn on the GDELT feed to surface sentiment and impact metrics."
              />
            )}
          </div>

          <div className="grid flex-1 min-h-0 grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="min-h-0">
              {datasets.gdelt ? (
                <InsightsPanel insights={gdeltInsights} isLoading={gdeltLoading} error={gdeltError} />
              ) : (
                <DisabledDatasetCard
                  title="Insights paused"
                  description="Switch the GDELT dataset back on to surface keyword and actor insights."
                />
              )}
            </div>

            <div className="min-h-0">
              <ActivityPanel datasets={datasetStatuses} recentQueries={recentQueries} />
            </div>

            <div className="xl:col-span-2 flex min-h-0 flex-col">
              {datasets.poly ? (
                <div className="card flex min-h-0 flex-col gap-5 rounded-2xl border border-[color:var(--border)]/70 bg-[color:var(--card)]/90 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[color:var(--fg)]">Polymarket highlights</h3>
                    <span className="meta uppercase tracking-[0.2em]">Top markets</span>
                  </div>
                  <div className="min-h-0 overflow-y-auto pr-1">
                    <PolyMarketGrid
                      markets={markets}
                      onOpen={(id) => openPanel("market", { id })}
                      isLoading={polyLoading}
                      error={polyError}
                    />
                  </div>
                </div>
              ) : (
                <DisabledDatasetCard
                  title="Polymarket disabled"
                  description="Enable the Polymarket dataset to browse high-liquidity markets."
                />
              )}
            </div>

            <div className="xl:col-span-2 min-h-0">
              <TwitterPlaceholder comingSoon={comingSoon} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
