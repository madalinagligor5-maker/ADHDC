import Constants from 'expo-constants';

import i18n from '@/i18n';
import type { CoachMessage } from './types';

/**
 * Conversational backend for free-text chat. Quick actions and task break-down
 * are handled deterministically in `logic.ts`; this only powers open chat.
 */
export interface CoachService {
  readonly isMock: boolean;
  sendMessage: (history: CoachMessage[]) => Promise<string>;
}

/** Reads the LLM key from app config or env. Never hardcode secrets. */
export function getCoachApiKey(): string | undefined {
  const fromConfig = (Constants.expoConfig?.extra as { coachApiKey?: string } | undefined)
    ?.coachApiKey;
  return fromConfig || process.env.EXPO_PUBLIC_COACH_API_KEY || undefined;
}

/** Offline, rule-light fallback: warm supportive replies, fully localized. */
export const mockCoachService: CoachService = {
  isMock: true,
  sendMessage: async () => {
    const replies = i18n.t('coach:chatReplies', { returnObjects: true }) as string[];
    return replies[Math.floor(Math.random() * replies.length)] ?? i18n.t('coach:messages.fallback');
  },
};

/**
 * Calls an Anthropic-style Messages API when a key is configured. Note: calling
 * the LLM directly from the client exposes the key — for production, proxy this
 * through your own backend. Falls back to the mock on any error.
 */
function createRemoteCoachService(apiKey: string): CoachService {
  const model = process.env.EXPO_PUBLIC_COACH_MODEL || 'claude-haiku-4-5';
  return {
    isMock: false,
    sendMessage: async (history) => {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model,
            max_tokens: 400,
            system: i18n.t('coach:systemPrompt', { lng: i18n.language }),
            messages: history.map((m) => ({
              role: m.role === 'coach' ? 'assistant' : 'user',
              content: m.text,
            })),
          }),
        });
        if (!res.ok) throw new Error(`Coach API ${res.status}`);
        const data = (await res.json()) as { content?: { text?: string }[] };
        return data.content?.[0]?.text?.trim() || i18n.t('coach:messages.fallback');
      } catch {
        return mockCoachService.sendMessage(history);
      }
    },
  };
}

export function createCoachService(): CoachService {
  const key = getCoachApiKey();
  return key ? createRemoteCoachService(key) : mockCoachService;
}
