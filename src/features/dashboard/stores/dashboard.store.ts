import { create } from 'zustand';

interface DashboardState {
  filter: string;
  setFilter: (filter: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  filter: '',
  setFilter: (filter) => set({ filter }),
}));
