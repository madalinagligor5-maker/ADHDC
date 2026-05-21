/**
 * Calendar sync abstraction. The app is offline-first; external calendar
 * integration (Google / Apple via expo-calendar or OAuth) is stubbed behind
 * this interface so the UI can wire to it without committing to a provider.
 *
 * Swap `noopCalendarSync` for a real implementation later — nothing else in
 * the app needs to change.
 */
export interface ExternalEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

export interface CalendarSyncService {
  readonly providerName: string;
  isConnected(): Promise<boolean>;
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  importEvents(rangeStart: Date, rangeEnd: Date): Promise<ExternalEvent[]>;
}

export const noopCalendarSync: CalendarSyncService = {
  providerName: 'none',
  isConnected: async () => false,
  connect: async () => false,
  disconnect: async () => {},
  importEvents: async () => [],
};

let active: CalendarSyncService = noopCalendarSync;

export function getCalendarSync(): CalendarSyncService {
  return active;
}

export function setCalendarSync(service: CalendarSyncService): void {
  active = service;
}
