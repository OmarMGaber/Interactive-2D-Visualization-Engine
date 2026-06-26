import { create } from 'zustand';

type ModalType = 'CREATE_ARRAY' | 'CREATE_LINKED_LIST' | 'CREATE_GRAPH' | 'SETTINGS' | null;

/**
 * This store manages the state of modals in a React application.
 */
interface ModalState {
    type: ModalType;
    isOpen: boolean;
    openModal: (type: ModalType) => void;
    closeModal: () => void;

    // data: any;
}

export const useModalStore = create<ModalState>((set) => ({
    type: null,
    isOpen: false,
    openModal: (type) => set({ type, isOpen: true }),
    closeModal: () => set({ type: null, isOpen: false }),
}));    