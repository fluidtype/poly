"use client";

import { create } from "zustand";

export type Datasets = {
  gdelt: boolean;
  poly: boolean;
  twitter: boolean;
};

export type Preset = "7D" | "30D" | "90D" | "CUSTOM";

export const twitterDatasetEnabled = process.env.NEXT_PUBLIC_ENABLE_TWITTER === "1";

const presetDurations: Record<Exclude<Preset, "CUSTOM">, number> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
};

export function utcYYYYMMDD(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function presetRange(days: number): { start: string; end: string } {
  const now = new Date();
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

  return {
    start: utcYYYYMMDD(startDate),
    end: utcYYYYMMDD(endDate),
  };
}

const defaultRange = presetRange(presetDurations["7D"]);

type GlobalFiltersState = {
  keywords: string[];
  dateStart: string;
  dateEnd: string;
  activePreset: Preset;
  datasets: Datasets;
  setKeywords: (keywords: string[]) => void;
  setDateRange: (start: string, end: string, preset?: Preset) => void;
  setPreset: (preset: Preset) => void;
  toggleDataset: (dataset: keyof Datasets) => void;
};

export const useGlobalFilters = create<GlobalFiltersState>((set) => ({
  keywords: [],
  dateStart: defaultRange.start,
  dateEnd: defaultRange.end,
  activePreset: "7D",
  datasets: {
    gdelt: true,
    poly: true,
    twitter: twitterDatasetEnabled,
  },
  setKeywords: (keywords) => set({ keywords }),
  setDateRange: (start, end, preset) =>
    set(() => ({
      dateStart: start,
      dateEnd: end,
      activePreset: preset ?? "CUSTOM",
    })),
  setPreset: (preset) =>
    set(() => {
      if (preset === "CUSTOM") {
        return { activePreset: "CUSTOM" as Preset };
      }

      const { start, end } = presetRange(presetDurations[preset]);

      return {
        dateStart: start,
        dateEnd: end,
        activePreset: preset,
      };
    }),
  toggleDataset: (dataset) =>
    set((state) => {
      if (dataset === "twitter" && !twitterDatasetEnabled) {
        return state;
      }

      return {
        datasets: {
          ...state.datasets,
          [dataset]: !state.datasets[dataset],
        },
      };
    }),
}));