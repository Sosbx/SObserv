import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastStore {
  toast: Toast | null;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(7);
    set({ toast: { id, message, type } });
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      set((state) => {
        // Only remove if it's the same toast (check by id)
        if (state.toast?.id === id) {
          return { toast: null };
        }
        return state;
      });
    }, 3000);
  },
  removeToast: () => {
    set({ toast: null });
  },
}));