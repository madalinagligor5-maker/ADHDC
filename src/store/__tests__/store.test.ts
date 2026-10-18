import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { addDays, todayKey } from '@/domain/date';
import { useAppStore } from '../useAppStore';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const store = () => useAppStore.getState();
const today = todayKey();
const yesterday = addDays(today, -1);

beforeEach(async () => {
  store().resetAll();
  await AsyncStorage.clear();
});

describe('manual entries', () => {
  it('edits an existing app value instead of adding to it', () => {
    expect(store().setAppMinutes(today, 'tiktok', 30)).toBeNull();
    expect(store().setAppMinutes(today, 'tiktok', 45)).toBeNull();
    expect(store().days[today].usage).toEqual({ tiktok: 45 });
  });

  it('rejects invalid values without saving', () => {
    expect(store().setAppMinutes(today, 'tiktok', -1)).toBe('negative');
    store().setAppMinutes(today, 'instagram', 1400);
    expect(store().setAppMinutes(today, 'tiktok', 60)).toBe('over-day');
    expect(store().days[today].usage.tiktok).toBeUndefined();
  });

  it('deletes an entry and leaves the day without data', () => {
    store().setAppMinutes(today, 'youtube', 20);
    store().deleteAppMinutes(today, 'youtube');
    expect(store().days[today].usage).toEqual({});
  });
});

describe('sources', () => {
  it('never overwrites a manual day with automatic data', () => {
    store().setAppMinutes(today, 'tiktok', 30);
    expect(store().applyAutoUsage(today, { tiktok: 90 })).toBe(false);
    expect(store().days[today].usage.tiktok).toBe(30);
  });

  it('turns an automatic day into a manual one when edited', () => {
    expect(store().applyAutoUsage(today, { tiktok: 50, instagram: 10 })).toBe(true);
    expect(store().days[today].source).toBe('auto');
    store().setAppMinutes(today, 'tiktok', 40);
    expect(store().days[today]).toMatchObject({ source: 'manual', usage: { tiktok: 40, instagram: 10 } });
  });
});

describe('daily limit history', () => {
  it('applies a new goal to today only', () => {
    store().updateSettings({ dailyLimitMin: 60 });
    store().setAppMinutes(yesterday, 'tiktok', 50);
    store().setAppMinutes(today, 'tiktok', 50);
    store().updateSettings({ dailyLimitMin: 30 });
    expect(store().days[yesterday].limitMin).toBe(60);
    expect(store().days[today].limitMin).toBe(30);
  });

  it('rejects invalid limits', () => {
    store().updateSettings({ dailyLimitMin: 0 });
    expect(store().settings.dailyLimitMin).toBeGreaterThan(0);
  });
});

describe('pauses and challenges', () => {
  it('confirms a pause challenge only after a completed long-enough pause', () => {
    const now = Date.now();
    store().setChallenge(today, 'pause-20');
    store().startPause(20, now);
    store().endPause(now + 5 * 60_000);
    expect(store().days[today].challengeDone).toBe(false);

    store().startPause(20, now);
    const session = store().endPause(now + 20 * 60_000);
    expect(session?.completed).toBe(true);
    expect(store().days[today]).toMatchObject({ challengeDone: true, challengeVerified: true });
    expect(store().pauses).toHaveLength(2);
  });
});

describe('demo mode', () => {
  it('keeps demo pauses out of real data', () => {
    store().enterDemo();
    store().startPause(15, 0);
    store().endPause(15 * 60_000);
    expect(store().pauses).toHaveLength(0);
    store().exitDemo();
    expect(store().demo).toBe(false);
  });
});

describe('persistence and reset', () => {
  it('writes to storage and restores after a restart', async () => {
    store().setAppMinutes(today, 'tiktok', 25);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const raw = await AsyncStorage.getItem('scrollfade-state');
    expect(raw).toContain('"tiktok":25');

    // Simulate a restart: in-memory state is lost, storage keeps what was written.
    useAppStore.setState({ days: {} });
    await AsyncStorage.setItem('scrollfade-state', raw as string);
    await useAppStore.persist.rehydrate();
    expect(store().days[today].usage.tiktok).toBe(25);
  });

  it('does not persist demo mode', async () => {
    store().enterDemo();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(await AsyncStorage.getItem('scrollfade-state')).not.toContain('"demo"');
  });

  it('resets everything but the language', () => {
    store().updateSettings({ language: 'en' });
    store().setAppMinutes(today, 'tiktok', 25);
    store().resetAll();
    expect(store().days).toEqual({});
    expect(store().onboarded).toBe(false);
    expect(store().settings.language).toBe('en');
  });
});
