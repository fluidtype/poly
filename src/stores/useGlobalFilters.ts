"use client";

import { create } from "zustand";

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

const now = new Date();
const defaultEnd = formatDate(now);
const defaultStart = formatDate(new Date(now.getTime() - 6 * MILLISECONDS_IN_DAY));

export const twitterDatasetEnabled = process.env.NEXT_PUBLIC_ENABLE_TWITTER === "1";

type DatasetKey = "gdelt" | "poly" | "twitter";

type GlobalFiltersState = {
  keywords: string[];
  dateStart: string;
  dateEnd: string;
  datasets: Record<DatasetKey, boolean>;
  setKeywords: (keywords: string[]) => void;
  setDateRange: (start: string, end: string) => void;
  toggleDataset: (dataset: DatasetKey) => void;
};

export const useGlobalFilters = create<GlobalFiltersState>((set) => ({
  keywords: [],
  dateStart: defaultStart,
  dateEnd: defaultEnd,
  datasets: {
    gdelt: true,
    poly: true,
    twitter: twitterDatasetEnabled,
  },
  setKeywords: (keywords) => set({ keywords }),
  setDateRange: (start, end) => set({ dateStart: start, dateEnd: end }),
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
