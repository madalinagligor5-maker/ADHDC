import { create } from 'zustand';

import { insertFocusSession, listFocusSessions } from '@/db/focusRepo';
import type { FocusSession, NewFocusSession } from '@/features/focus/types';

interface FocusState {
  sessions: FocusSession[];
  loaded: boolean;
  load: () => Promise<void>;
  logSession: (input: NewFocusSession) => Promise<FocusSession>;
}

export const useFocusStore = create<FocusState>((set) => ({
  sessions: [],
  loaded: false,

  load: async () => {
    const sessions = await listFocusSessions();
    set({ sessions, loaded: true });
  },

  logSession: async (input) => {
    const session = await insertFocusSession(input);
    set((state) => ({ sessions: [session, ...state.sessions] }));
    return session;
  },
}));
