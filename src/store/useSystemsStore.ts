import type { SystemInfo } from "@/engine/systems/System";
import { create } from "zustand";

export type SystemsStore = {
    systems: SystemInfo[];
    setSystems: (systems: SystemInfo[]) => void;
}

/**
 * This store manages the state of systems of the runtime in a React application.
 */
export const useSystemsStore = create<SystemsStore>((set) => ({
    systems: [],
    setSystems: (systems) => set({ systems }),
}));
