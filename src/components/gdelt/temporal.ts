import type { GdeltInsights } from "@/types";

export interface TemporalEntry {
  label: string;
  value: number;
}

const extractTemporalCandidates = (input: unknown): unknown[] => {
  if (Array.isArray(input)) {
    return input;
  }

  if (typeof input === "object" && input !== null) {
    const record = input as Record<string, unknown>;

    if ("series" in record) {
      const series = record.series;
      const flattenedSeries = (Array.isArray(series) ? series : [series])
        .filter(Boolean)
        .flatMap((item) => extractTemporalCandidates(item));

      if (flattenedSeries.length > 0) {
        return flattenedSeries;
      }
    }

    if ("timeline" in record) {
      const timelineCandidates = extractTemporalCandidates(record.timeline);
      if (timelineCandidates.length > 0) {
        return timelineCandidates;
      }
    }

    if ("data" in record) {
      const dataCandidates = extractTemporalCandidates(record.data);
      if (dataCandidates.length > 0) {
        return dataCandidates;
      }
    }

    return Object.values(record);
  }

  return [];
};

const mapTemporalEntries = (raw: unknown[]): TemporalEntry[] =>
  raw
    .map((item) => {
      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        const label =
          typeof record.date === "string"
            ? record.date
            : typeof record.label === "string"
              ? record.label
              : typeof record.name === "string"
                ? record.name
                : null;
        const valueCandidate = record.count ?? record.value ?? record.total;
        const value = typeof valueCandidate === "number" ? valueCandidate : Number(valueCandidate);
        if (label && Number.isFinite(value)) {
          return { label, value };
        }
      }
      return null;
    })
    .filter((entry): entry is TemporalEntry => Boolean(entry));

export const toTemporalEntries = (insights?: GdeltInsights): TemporalEntry[] => {
  if (!insights) {
    return [];
  }

  const primary = mapTemporalEntries(extractTemporalCandidates(insights.temporal_distribution));
  if (primary.length > 0) {
    return primary;
  }

  return mapTemporalEntries(extractTemporalCandidates(insights.timeline));
};
