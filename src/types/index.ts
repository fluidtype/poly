export interface GdeltSeriesPoint {
  date: string;
  conflict_events?: number;
  avg_sentiment?: number;
  avg_impact?: number;
  interaction_count?: number;
  relative_coverage?: number;
}

export interface GdeltEvent {
  SQLDATE: number | string;
  SOURCEURL: string;
  Actor1CountryCode?: string;
  Actor2CountryCode?: string;
  EventCode?: string;
  AvgTone?: number;
  /* add other GDELT fields */
  [key: string]: unknown;
}

export interface GdeltContextApiItem extends GdeltEvent {
  DayDate?: string | number;
  conflict_events?: number;
  avg_sentiment?: number;
  avg_impact?: number;
  interaction_count?: number;
  relative_coverage?: number;
}

export interface GdeltContextApiResponse {
  data?: GdeltContextApiItem[];
  insights?: GdeltInsights;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

export interface GdeltTemporalDatum {
  date?: string | null;
  label?: string | null;
  name?: string | null;
  count?: number | string | null;
  value?: number | string | null;
  total?: number | string | null;
  [key: string]: unknown;
}

export interface GdeltTemporalSeriesNode {
  label?: string | null;
  name?: string | null;
  series?: Array<GdeltTemporalSeriesNode | GdeltTemporalDatum | null> | null;
  timeline?: Array<GdeltTemporalSeriesNode | GdeltTemporalDatum | null> | GdeltTemporalSeriesNode | null;
  data?: Array<GdeltTemporalSeriesNode | GdeltTemporalDatum | null> | GdeltTemporalSeriesNode | null;
  [key: string]: unknown;
}

export type GdeltTemporalInsight =
  | GdeltTemporalDatum[]
  | Record<string, GdeltTemporalDatum | number | string | null>
  | {
      series?: Array<GdeltTemporalSeriesNode | GdeltTemporalDatum | null> | null;
      timeline?:
        | Array<GdeltTemporalSeriesNode | GdeltTemporalDatum | null>
        | GdeltTemporalSeriesNode
        | null;
      data?: Array<GdeltTemporalSeriesNode | GdeltTemporalDatum | null> | GdeltTemporalSeriesNode | null;
      [key: string]: unknown;
    };

export interface GdeltInsights {
  total_events?: number;
  keyword_matches?: Record<string, number>;
  sentiment_analysis?: {
    avg_tone?: number;
  };
  temporal_distribution?: GdeltTemporalInsight | null;
  timeline?: GdeltTemporalInsight | null;
  spikes?: Array<string | { label?: string | null; date?: string | null; [key: string]: unknown }>;
  top_actors?:
    | Array<string | { name?: string | null; actor?: string | null; label?: string | null; count?: number | string | null }> 
    | Record<string, number>
    | null;
  actor_counts?:
    | Array<string | { name?: string | null; actor?: string | null; label?: string | null; count?: number | string | null }>
    | Record<string, number>
    | null;
  [key: string]: unknown;
}

export interface PolyToken {
  id: string;
  outcome: "YES" | "NO";
  price?: number;
}

export interface PolyTokenApi {
  id?: string | number | null;
  outcome?: string | null;
  price?: number | string | null;
  [key: string]: unknown;
}

export interface PolyMarket {
  id: string;
  slug?: string;
  title: string;
  endDate: string | null;
  volume24h: number;
  liquidity: number;
  status: string;
  category?: string;
  tokens: PolyToken[];
  priceYes?: number;
  priceNo?: number;
}

export interface PolyMarketApi {
  id?: string | number | null;
  slug?: string | null;
  title?: string | null;
  endDate?: string | null;
  volume24h?: number | string | null;
  liquidity?: number | string | null;
  status?: string | null;
  category?: string | null;
  tokens?: PolyTokenApi[] | null;
  [key: string]: unknown;
}

export type PolySearchApiResponse =
  | PolyMarketApi[]
  | {
      markets?: PolyMarketApi[] | null;
      data?: PolyMarketApi[] | null;
      [key: string]: unknown;
    };

export interface PolyTrade {
  price: number;
  size: number;
  timestamp: string;
}
