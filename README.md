# ScrollFade

> **Mai puțin scroll, mai mult focus.**

ScrollFade este o aplicație mobilă (iOS + Android) care îți arată cât timp petreci în TikTok, Instagram Reels, YouTube Shorts și alte feed-uri short-form, îți dă un **Fade Score** zilnic (0–100) și te ajută să reduci scroll-ul cu provocări, streak-uri și un mod Focus.

Fără cont, fără server, fără reclame. **Datele rămân pe dispozitiv.**

---

## Tehnologie

| Zonă | Alegere |
| --- | --- |
| Framework | React Native + **Expo SDK 58**, TypeScript strict |
| Navigare | **Expo Router** (rute în `src/app/`) |
| Stare | **Zustand** + `persist` |
| Stocare locală | **AsyncStorage** (offline, pe dispozitiv) |
| Grafică | `react-native-svg` (inel de progres, grafic, creier) |
| Screen time Android | Modul Expo local `modules/usage-stats` (Kotlin, `UsageStatsManager`) |
| Notificări | `expo-notifications` (doar locale) |
| Teste | Jest (`jest-expo`) pentru logica de scor, streak și provocări |

## Rulare

Cerințe: Node 20+ și npm.

```bash
npm install
npm start            # pornește Metro; scanează QR-ul cu Expo Go
```

Verificări:

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # expo lint
npm test             # jest
```

### Versiune web (Vercel)

```bash
npm run web          # dev server în browser
npm run build:web    # export static în dist/
```

`vercel.json` configurează build-ul (`npm run build:web`, output `dist`, rewrite SPA către `index.html`). Pe web rulează modul manual; notificările și screen time-ul automat nu sunt disponibile.

### Expo Go vs. development build

- **Expo Go** rulează tot MVP-ul în **modul manual** (introduci minutele). Modulul nativ de screen time nu există în Expo Go, așa că aplicația afișează automat fallback-ul.
- Pentru **modul automat pe Android** ai nevoie de un development build, pentru că proiectul include cod nativ propriu:

```bash
npm run android:dev                      # npx expo run:android (Android Studio + SDK local)
# sau în cloud:
npx eas-cli@latest build --profile development --platform android
```

Folderele `ios/` și `android/` sunt generate (Continuous Native Generation) și nu sunt versionate. Comportamentul nativ se configurează din `app.json`.

## Configurare platforme

### Android

- `app.json` declară permisiunea `android.permission.PACKAGE_USAGE_STATS`.
- Aceasta este o permisiune specială: utilizatorul o acordă din **Setări → Acces la utilizare**. Butonul „Permite accesul” deschide direct ecranul respectiv, iar aplicația re-verifică accesul când revii în ea.
- Timpul se calculează din evenimentele `MOVE_TO_FOREGROUND` / `MOVE_TO_BACKGROUND` ale pachetelor urmărite (vezi `src/domain/apps.ts` pentru lista de pachete).
- Pentru publicare în Google Play, permisiunea `PACKAGE_USAGE_STATS` trebuie justificată în Play Console (declarația de permisiuni sensibile).

### iOS

- `bundleIdentifier`: `app.scrollfade.mobile` (schimbă-l cu al tău).
- În MVP, iOS rulează **doar în modul manual** (vezi limitările de mai jos). Arhitectura e pregătită: `src/services/screenTime/iosProvider.ts` implementează aceeași interfață ca providerul Android.

## Limitări Screen Time API

**iOS**

1. Accesul la Screen Time se face prin framework-urile **FamilyControls**, **DeviceActivity** și **ManagedSettings**.
2. Ai nevoie de entitlement-ul `com.apple.developer.family-controls`, pe care Apple îl aprobă manual (cerere separată pentru distribuție în App Store).
3. Apple **nu oferă aplicației minutele brute**: datele se văd doar într-o extensie `DeviceActivityReport` (UI izolat), iar aplicația primește praguri/evenimente prin `DeviceActivityMonitor`. Pentru un Fade Score automat pe iOS, varianta realistă este:
   - o extensie `DeviceActivityMonitor` cu praguri (ex. la 15/30/60 min) care scrie într-un App Group,
   - aplicația citește din App Group pragurile atinse și estimează minutele.
4. Integrarea cere target-uri native suplimentare (extensii) printr-un config plugin, de exemplu cu biblioteca `react-native-device-activity`. **Nu blochează MVP-ul**: providerul iOS returnează „indisponibil”, iar aplicația folosește modul manual.

**Android**

- Funcționează doar în development/production build (nu în Expo Go).
- Timpul măsurat este timpul total în aplicație (de ex. tot Instagram, nu doar Reels). Android nu separă Reels/Shorts de restul aplicației.
- Pe unele dispozitive (anumite skin-uri OEM) datele de utilizare pot fi întârziate sau incomplete.

## Arhitectură

```
src/
  app/                    # Expo Router (fiecare fișier = ecran)
    _layout.tsx           # Stack rădăcină, temă dark, ErrorBoundary, așteaptă datele locale
    onboarding/           # 1. promisiunea · 2. alegerea aplicațiilor · 3. permisiune
    (tabs)/               # Dashboard · Provocări · Istoric · Setări
    score.tsx             # Detaliu scor zilnic
    manual-entry.tsx      # Introducere manuală a timpului
    focus.tsx             # Mod Focus (timer)
    paywall.tsx           # ScrollFade Plus — „În curând”
  components/             # Design system: Button, Card, ProgressRing, ScoreBadge, ChallengeCard, ...
  domain/                 # Logică pură, fără React: scor, provocări, streak, planuri, date
  hooks/                  # useToday, useScreenTimeSync
  i18n/                   # ro.ts (implicit, sursa de adevăr), en.ts
  services/
    screenTime/           # Interfața comună + provider Android / iOS / manual
    notifications.ts      # Reminder zilnic local
  store/useAppStore.ts    # Zustand + AsyncStorage
modules/usage-stats/      # Modul Expo local (Kotlin) pentru UsageStatsManager
```

### O singură interfață de date

Modul manual și cel automat produc același tip: `UsageMap` (minute per aplicație pentru o zi), salvat prin `setUsage(date, usage, source)`. Scorul, streak-ul și istoricul nu știu de unde vin datele. Providerii implementează `ScreenTimeProvider` (`src/services/screenTime/types.ts`):

```ts
interface ScreenTimeProvider {
  getAvailability(): { available: true } | { available: false; reason: 'ios' | 'needs-native-build' | 'web' };
  getPermission(): Promise<'granted' | 'denied' | 'unavailable'>;
  requestPermission(): Promise<'granted' | 'denied' | 'unavailable'>;
  getUsage(date: DateKey, apps: AppId[]): Promise<UsageMap>;
}
```

Datele introduse manual au prioritate: sincronizarea automată nu suprascrie o zi editată de utilizator.

## Fade Score

Definit în `src/domain/score.ts` (`SCORE_RULES`), ușor de ajustat:

| Regulă | Puncte |
| --- | --- |
| Start | 100 |
| Minutele 0–30 | −0,5 / minut |
| Minutele 31–60 | −1 / minut |
| Peste 60 de minute | −1,5 / minut |
| Provocarea zilei finalizată | +10 |
| Limita zilnică respectată | +15 |
| Sesiune Focus completă (15/30/45/60 min) | +3 / +5 / +8 / +10 (max. +20 pe zi) |

Scorul este rotunjit și limitat la intervalul 0–100.

| Scor | Nivel |
| --- | --- |
| 90–100 | Creier curat |
| 70–89 | Focus bun |
| 40–69 | Scroll moderat |
| 10–39 | Brainrot ridicat |
| 0–9 | Mod NPC |

**Streak:** o zi contează dacă limita a fost respectată **sau** provocarea a fost finalizată. Ziua curentă nu rupe streak-ul cât timp nu s-a terminat.

## Localizare

- Toate textele sunt în `src/i18n/ro.ts` (implicit). `en.ts` are exact aceeași structură, verificată de TypeScript.
- Limba se schimbă din Setări. Pentru o limbă nouă: adaugi un fișier tipizat `Strings` și îl înregistrezi în `src/i18n/index.ts`.

## Monetizare (pregătită, neactivă)

`src/domain/plans.ts` definește planurile:

- **Free:** scor zilnic, o provocare pe zi, istoric 7 zile.
- **Plus:** istoric nelimitat, 3 provocări pe zi, Focus avansat, blocaje programate, statistici detaliate.

`currentPlan()` întoarce mereu `'free'`. Ecranul Paywall afișează „În curând”; nu există plăți în MVP.

## Confidențialitate

- Nu există backend, cont, analytics sau reclame.
- Datele de utilizare se citesc doar după ecranul care explică scopul și doar cu acordul utilizatorului.
- „Resetează datele” din Setări șterge tot de pe dispozitiv.
