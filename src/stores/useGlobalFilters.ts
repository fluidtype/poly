import { create } from "zustand";

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

const twitterEnabled =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_TWITTER_ENABLED !== "false"
    : true;

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}${month}${day}`;
};

const parseDateKey = (value: string) => {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6)) - 1;
  const day = Number(value.slice(6, 8));
  return new Date(year, month, day);
};

const today = new Date();
const defaultStart = new Date(today);
defaultStart.setDate(defaultStart.getDate() - 6);

type GlobalFiltersStore = GlobalFiltersState & {
  setKeywords: (keywords: string[]) => void;
  setDateRange: (start: string, end: string) => void;
  toggleDataset: (dataset: DatasetKey) => void;
};

const useGlobalFilters = create<GlobalFiltersStore>((set) => ({
  keywords: [],
  dateStart: formatDateKey(defaultStart),
  dateEnd: formatDateKey(today),
  datasets: {
    gdelt: true,
    poly: true,
    twitter: twitterEnabled,
  },
  setKeywords: (keywords) => set({ keywords }),
  setDateRange: (dateStart, dateEnd) => set({ dateStart, dateEnd }),
  toggleDataset: (dataset) =>
    set((state) => {
      if (dataset === "twitter" && !twitterEnabled) {
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

const subscribeToGlobalFilters = (
  listener: (state: GlobalFiltersState) => void,
) => useGlobalFilters.subscribe((state) => listener(state));

export type { GlobalFiltersState, DatasetKey };
export { formatDateKey, parseDateKey, subscribeToGlobalFilters, twitterEnabled };
export default useGlobalFilters;
