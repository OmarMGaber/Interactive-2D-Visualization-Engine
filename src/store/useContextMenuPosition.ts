import { create } from "zustand";

/**
 * This store manages the position of a context menu in a React application.
 */
type ContextMenuState = {
  position: { x: number; y: number };
  updatePosition: (x: number, y: number) => void;
  resetPosition: () => void;
};

export const useContextMenuPosition = create<ContextMenuState>((set) => ({
  position: { x: 0, y: 0 },
  updatePosition: (x, y) => set({ position: { x, y } }),
  resetPosition: () => set({ position: { x: 0, y: 0 } }),
}));