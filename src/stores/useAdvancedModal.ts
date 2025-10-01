import { create } from "zustand";

type AdvancedModalState = {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const useAdvancedModal = create<AdvancedModalState>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));

export default useAdvancedModal;
