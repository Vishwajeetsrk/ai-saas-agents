import { create } from 'zustand';

export interface CreditsStore {
  credits: number;
  usedCredits: number;
  setCredits: (credits: number) => void;
  setUsedCredits: (used: number) => void;
  deductCredits: (amount: number) => boolean;
  getAvailableCredits: () => number;
}

export const useCreditsStore = create<CreditsStore>((set, get) => ({
  credits: 0,
  usedCredits: 0,
  setCredits: (credits) => set({ credits }),
  setUsedCredits: (usedCredits) => set({ usedCredits }),
  deductCredits: (amount) => {
    const { credits, usedCredits } = get();
    const available = credits - usedCredits;
    if (available >= amount) {
      set({ usedCredits: usedCredits + amount });
      return true;
    }
    return false;
  },
  getAvailableCredits: () => {
    const { credits, usedCredits } = get();
    return credits - usedCredits;
  },
}));

export interface UserStore {
  userId: string | null;
  plan: 'free' | 'pro' | null;
  setUser: (userId: string, plan: 'free' | 'pro') => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userId: null,
  plan: null,
  setUser: (userId, plan) => set({ userId, plan }),
  logout: () => set({ userId: null, plan: null }),
}));

export interface AgentStore {
  isLoading: boolean;
  output: string;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setOutput: (output: string) => void;
  setError: (error: string | null) => void;
  clearOutput: () => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  isLoading: false,
  output: '',
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setOutput: (output) => set({ output }),
  setError: (error) => set({ error }),
  clearOutput: () => set({ output: '', error: null }),
}));
