# ADHDCal

> Plan. Focus. Thrive.

A warm, calm, cross-platform (iOS + Android) planner built for people with ADHD.
Gentle planning, sustained focus and positive reinforcement — never shaming.

Built with **Expo + React Native + TypeScript**, **expo-router**, **Zustand**,
**SQLite** (offline-first), and fully localized in **Romanian, English and
French**.

## Features

- **Onboarding** — gentle setup (name, language, goals, focus hours, reminders).
- **Home (Today)** — greeting, daily intention, week strip, today's plan, quick
  focus + mood cards.
- **Tasks** — Today / Upcoming / Projects views, **brain dump** capture,
  sub-task decomposition ("break it down"), swipe to complete/snooze.
- **Focus timer** — Pomodoro / Deep Focus, circular ring, a plant that grows,
  ambient-sound picker, confetti + auto-logged sessions.
- **Habits** — week/month heatmap, gentle "don't break the chain" streaks.
- **Mood** — face check-ins with notes, a trend chart and history.
- **Calendar** — month/week/day with time-blocking and day-load indicators.
- **AI Coach** — mascot chat with quick actions, wired to real app data.
- **Achievements** — levels, streaks, a growing garden and badges.
- **Reminders** — friendly, fine-grained local notifications.

Throughout: warm, never-shaming copy, light + dark themes, a reduce-motion
setting, and AA-minded contrast.

## Getting started

```bash
npm install
npm start        # then press i (iOS), a (Android), or w (web)
```

Other scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run format      # prettier --write
npm test            # jest (core-logic unit tests)
```

> This project uses `legacy-peer-deps` (see `.npmrc`) to smooth over Expo's
> transitive peer-dependency ranges. Native modules are pinned to the versions
> bundled with the installed Expo SDK.

## Project structure

```
app/                 # expo-router routes (tabs + stack sub-screens)
src/
  components/        # design-system UI + illustrations (mascot, plant)
  db/                # SQLite: open/migrate + per-domain repositories
  features/          # domain logic + screens-specific components
    tasks/ projects/ focus/ habits/ mood/ calendar/ coach/
    gamification/ notifications/
  i18n/              # i18next setup + typed resources
  locales/           # en / ro / fr translation namespaces
  store/             # Zustand stores (settings + domain stores)
  theme/             # design tokens + ThemeProvider (light / dark)
  utils/             # date/id helpers
```

## Architecture

- **Offline-first.** All data lives in local SQLite (`src/db`), accessed through
  thin repositories and surfaced via Zustand stores. Schema changes go through a
  versioned migration (`PRAGMA user_version`).
- **Sync-ready.** External calendar sync is abstracted behind
  `CalendarSyncService` (no-op default); the AI Coach behind `CoachService`
  (mock default). Both can be swapped for real implementations without touching
  the UI.
- **Tokens are the single source of truth** for color/spacing/typography; every
  component reads them so light/dark and accessibility stay consistent.

## Testing

Core logic (date math, streaks, levels/badges, task selectors, mood averages,
timer formatting) is covered by Jest unit tests:

```bash
npm test
```

## Accessibility

- Full **light + dark** themes and a **reduce-motion** setting (skips
  non-essential animations).
- OS **font scaling** is respected; touch targets are ≥44px.
- Interactive elements expose roles, labels and selected/disabled state.

## Internationalization

All user-facing copy lives in `src/locales/<lang>/<namespace>.json`. There are
no hardcoded strings in components. The app auto-detects the device language on
first launch (falling back to English) and the user can override it in
**Settings → Language**; the choice persists and switching is instant.

### Adding a new language

1. Create `src/locales/<lang>/` and copy every namespace JSON from `en/`,
   translating the values.
2. Add the language code to `SUPPORTED_LANGUAGES` in `src/i18n/index.ts`.
3. Register the imports in `src/i18n/resources.ts`.
4. Add its display name to the `languageNames` object in each `common.json`.

### Adding a new namespace

Create the JSON file in **all** locales, then list it in the `resources` and
`namespaces` exports in `src/i18n/resources.ts`. Type-safety is automatic.

## AI Coach key

The AI Coach works out of the box with a built-in **mock** (warm, offline
replies). To use a real LLM, provide an API key — read from config/env, never
hardcoded:

```bash
# .env (git-ignored) — Expo exposes EXPO_PUBLIC_* to the app
EXPO_PUBLIC_COACH_API_KEY=sk-...
EXPO_PUBLIC_COACH_MODEL=claude-haiku-4-5   # optional
```

Or via `app.json` → `expo.extra.coachApiKey`. When a key is present,
`createCoachService()` calls the Anthropic Messages API; otherwise it falls
back to the mock. Calling an LLM directly from the client exposes the key —
for production, proxy requests through your own backend.

## Adding ambient sounds

The Focus timer ships with an ambient-sound picker (Forest / Rain / Café) but
no audio files. To enable playback, drop looping audio into `assets/sounds/`
and register it in `src/features/focus/ambient.ts`:

```ts
const SOURCES = {
  forest: require('../../../assets/sounds/forest.mp3'),
  rain: require('../../../assets/sounds/rain.mp3'),
  cafe: require('../../../assets/sounds/cafe.mp3'),
};
```

Until then the picker is purely visual and playback is a no-op.

## License

Private / unpublished.
