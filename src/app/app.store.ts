import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  language: 'en' | 'vi';
  setLanguage: (language: 'en' | 'vi') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'app-storage',
    }
  )
);
