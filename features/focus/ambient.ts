import { Audio, type AVPlaybackSource } from 'expo-av';

export type AmbientSound = 'none' | 'forest' | 'rain' | 'cafe';

export const AMBIENT_SOUNDS: AmbientSound[] = ['none', 'forest', 'rain', 'cafe'];

/**
 * Map ambient keys to bundled looping audio files to enable playback. The app
 * ships without audio assets, so playback is a graceful no-op until files are
 * added (see README → "Adding ambient sounds"). The picker still works as UI.
 */
const SOURCES: Partial<Record<AmbientSound, AVPlaybackSource>> = {
  // forest: require('../../../assets/sounds/forest.mp3'),
  // rain: require('../../../assets/sounds/rain.mp3'),
  // cafe: require('../../../assets/sounds/cafe.mp3'),
};

let current: Audio.Sound | null = null;

export async function stopAmbient(): Promise<void> {
  if (!current) return;
  try {
    await current.stopAsync();
    await current.unloadAsync();
  } catch {
    // Sound may already be unloaded; ignore.
  }
  current = null;
}

export async function playAmbient(sound: AmbientSound): Promise<void> {
  await stopAmbient();
  const source = SOURCES[sound];
  if (sound === 'none' || !source) return;
  try {
    const { sound: instance } = await Audio.Sound.createAsync(source, {
      isLooping: true,
      volume: 0.6,
      shouldPlay: true,
    });
    current = instance;
  } catch {
    // Audio failed to load (e.g. asset missing); fail quietly.
    current = null;
  }
}
