import { toTemporalEntries } from "../temporal";
import type { GdeltInsights } from "@/types";

describe("toTemporalEntries", () => {
  it("normalizes array shaped temporal insights", () => {
    const insights: GdeltInsights = {
      temporal_distribution: [
        { date: "2024-01-01", count: 4 },
        { label: "2024-01-02", value: "6" },
      ],
    };

    expect(toTemporalEntries(insights)).toEqual([
      { label: "2024-01-01", value: 4 },
      { label: "2024-01-02", value: 6 },
    ]);
  });

  it("normalizes object shaped temporal insights", () => {
    const insights: GdeltInsights = {
      temporal_distribution: {
        series: [
          {
            label: "Events",
            timeline: [
              { date: "2024-01-03", count: 8 },
              { label: "2024-01-04", value: "9" },
            ],
          },
        ],
      },
    };

    expect(toTemporalEntries(insights)).toEqual([
      { label: "2024-01-03", value: 8 },
      { label: "2024-01-04", value: 9 },
    ]);
  });

  it("falls back to timeline payloads when temporal distribution is empty", () => {
    const insights: GdeltInsights = {
      temporal_distribution: [],
      timeline: {
        series: [
          {
            data: [
              { name: "2024-02-01", total: 12 },
              { label: "2024-02-02", total: "15" },
            ],
          },
        ],
      },
    };

    expect(toTemporalEntries(insights)).toEqual([
      { label: "2024-02-01", value: 12 },
      { label: "2024-02-02", value: 15 },
    ]);
  });
});
