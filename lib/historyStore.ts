import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GameHistoryEntry {
  id: string;
  artistName: string;
  artistId: string;
  artistImage?: string;
  datePlayed: number;
  totalGuesses: number;
  slotsRevealed: number;
  overflowCount: number;
  outcome: "won" | "gave_up";
  timeSeconds: number;
}

interface HistoryState {
  history: GameHistoryEntry[];
  addGame: (entry: GameHistoryEntry) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],

      addGame: (entry) =>
        set((state) => ({
          history: [entry, ...state.history].slice(0, 100),
        })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "top-songs-history",
    },
  ),
);
