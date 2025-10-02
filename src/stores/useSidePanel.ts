import { create } from "zustand";

type SidePanelMode = "event" | "market";

interface SidePanelPayload {
  id?: string;
  json?: Record<string, unknown> | null;
  title?: string;
  url?: string;
}

interface SidePanelState {
  isOpen: boolean;
  mode: SidePanelMode;
  payload?: SidePanelPayload;
  openPanel: (mode: SidePanelMode, payload?: SidePanelPayload) => void;
  closePanel: () => void;
}

export const useSidePanel = create<SidePanelState>((set) => ({
  isOpen: false,
  mode: "event",
  payload: undefined,
  openPanel: (mode, payload) => set({ isOpen: true, mode, payload }),
  closePanel: () => set({ isOpen: false, payload: undefined }),
}));
