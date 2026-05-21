import { create } from 'zustand';

import { deleteMoodEntry, insertMoodEntry, listMoodEntries } from '@/db/moodRepo';
import type { MoodEntry, NewMoodEntry } from '@/features/mood/types';

interface MoodState {
  entries: MoodEntry[];
  loaded: boolean;
  load: () => Promise<void>;
  addEntry: (input: NewMoodEntry) => Promise<MoodEntry>;
  removeEntry: (id: string) => Promise<void>;
}

export const useMoodStore = create<MoodState>((set) => ({
  entries: [],
  loaded: false,

  load: async () => {
    const entries = await listMoodEntries();
    set({ entries, loaded: true });
  },

  addEntry: async (input) => {
    const entry = await insertMoodEntry(input);
    set((state) => ({ entries: [entry, ...state.entries] }));
    return entry;
  },

  removeEntry: async (id) => {
    await deleteMoodEntry(id);
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
  },
}));
