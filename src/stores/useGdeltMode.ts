"use client";

import { create } from "zustand";

export type GdeltMode = "context" | "country" | "bilateral" | "bbva";

export type ContextParams = {
  includeInsights: boolean;
  limit: number;
};

export type CountryParams = {
  country: string;
};

export type BilateralParams = {
  country1: string;
  country2: string;
};

export type BbvaParams = {
  actor1: string;
  actor2: string;
  includeTotal: boolean;
  cameoCodes?: string;
};

type ModeParams = {
  context: ContextParams;
  country: CountryParams;
  bilateral: BilateralParams;
  bbva: BbvaParams;
};

type GdeltModeState = {
  mode: GdeltMode;
  params: Partial<ModeParams>;
  setMode: <TMode extends GdeltMode>(mode: TMode, params: ModeParams[TMode]) => void;
};

const defaultState: GdeltModeState = {
  mode: "context",
  params: {
    context: {
      includeInsights: true,
      limit: 500,
    },
  },
  setMode: () => {
    throw new Error("Store not initialized");
  },
};

export const useGdeltMode = create<GdeltModeState>((set) => ({
  ...defaultState,
  setMode: (mode, params) => set({ mode, params: { [mode]: params } }),
}));
