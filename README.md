# ScrollFade

> **Mai puțin scroll. Mai mult timp pentru tine.** · *Ieși din buclă.*

ScrollFade ajută utilizatorii să reducă scroll-ul automat prin obiective personale, pauze și progres vizibil. Aplicația este mobilă (iOS + Android), construită cu Expo, și are și o versiune web de prototip.

Fade Score arată progresul față de **obiectivul ales de utilizator**. Nu este o evaluare medicală. „Brainrot” apare doar ca expresie de marketing.

---

## Stare: implementat / simulat / necesită integrare

### ✅ Implementat și funcțional

| Zonă | Ce face |
| --- | --- |
| Onboarding | Welcome → obiectiv personal → aplicații → limită zilnică (30/60/90/120 sau valoare proprie) → sursa datelor. Totul se salvează local. |
| Introducere manuală | Zi + aplicație + ore/minute. Reintroducerea aceleiași aplicații pentru aceeași zi **înlocuiește** valoarea. Editare, ștergere cu confirmare, max. 24 h/zi, fără valori negative, marcaj „auto-raportat”. |
| Fade Score | `round(100 × min(1, limită / max(1, minute)))`. `null` fără date (diferit de 0 minute). Limita e salvată pe fiecare zi, deci schimbarea obiectivului nu rescrie istoricul. |
| Dashboard | Scor, explicație la prima folosire, timp, obiectiv, zile consecutive, sursa datelor, provocarea zilei, „Începe pauza”. Fără date apare „Primul pas începe aici.”, nu un scor inventat. |
| Streak | Doar zile **încheiate**, cu date și obiectiv respectat. Ziua curentă nu se numără. O zi fără date întrerupe seria. |
| Pauze | 15/20/30/45/60 min, Pauză / Reia / Încheie. Timer pe timestamp-uri: rămâne corect după background sau redeschidere. Mesaj explicit că pauza **nu blochează** alte aplicații. |
| Provocări | 4 provocări. „O pauză de 20 de minute” e **confirmată de timer**; celelalte sunt **auto-raportate**. Fără bonus la scor. |
| Progres | Grafice pentru timp (cu linia obiectivului pe fiecare zi) și scor. „—” = fără date, separat de 0. Zile cu obiectiv respectat, pauze încheiate, provocări bifate. |
| Free / Plus | Free: 7 zile de istoric. Plus: 30/90 de zile, raport săptămânal (compară doar când fiecare săptămână are ≥ 4 zile cu date), alegerea oricărei provocări. |
| Mod demo | „Explorează un exemplu”: date fixe, etichetate permanent „Date demonstrative”. Nu se salvează și nu se amestecă cu datele reale. |
| Setări | Limbă RO/EN, obiectiv, scop, aplicații, sursa datelor, reminder local, plan, export JSON, ștergere date cu confirmare, politică de confidențialitate și termeni (draft). |
| Paywall | „Previzualizare ofertă” cu prețurile propuse, plan anual evidențiat, reînnoire și anulare explicate, butonul „Disponibil în curând” (dezactivat), „Restabilește achizițiile” cu răspuns onest. |
| Localizare | Toate textele sunt în `src/i18n/ro.ts` și `en.ts`, cu aceeași structură (verificată de test). Plural românesc (1 zi / 5 zile / 20 de zile). Date și prețuri formatate după limbă. |
| Accesibilitate | Ținte de atingere ≥ 44 px, roluri și etichete pentru cititorul de ecran, text scalabil, animația inelului dezactivată la „Reduce motion”. |

### 🧪 Simulat pentru demonstrație

- **Modul demo**: 7 zile de date inventate (`src/domain/demo.ts`), etichetate peste tot.
- **Plus în development**: un comutator în Setări → Dezvoltare, disponibil doar când `__DEV__` e true. Build-urile de producție îl ignoră (`currentPlanFrom`).
- **Paywall**: prețurile vin din `PLANNED_PRICES`, nu dintr-un magazin. Nu se încasează nimic.

### 🔌 Necesită integrare externă

| Integrare | Stare | Ce trebuie |
| --- | --- | --- |
| Android – UsageStatsManager | **Cod scris, neverificat pe dispozitiv.** Modulul local `modules/usage-stats` (Kotlin) citește timpul din prim-plan per aplicație. | Development build (`npx expo run:android` sau EAS), test pe telefon real, declarația de permisiune în Google Play Console. |
| iOS – Screen Time | **Neimplementat.** Providerul raportează „indisponibil” și aplicația rămâne pe modul manual. | Entitlement `com.apple.developer.family-controls` aprobat de Apple, extensii `DeviceActivityMonitor` / `DeviceActivityReport`. Apple nu expune minutele brute către JavaScript. |
| Plăți (App Store / Google Play) | **Neimplementat.** Există interfața `SubscriptionService` și implementarea de previzualizare. | Produse `plus_monthly` / `plus_annual` în magazine, implementare a interfeței (direct sau printr-un serviciu dedicat), verificare a drepturilor. Accesul Plus nu trebuie să depindă de un flag local. |
| Blocare aplicații / blocare programată | **Neimplementat.** Apare doar în lista „În pregătire” din paywall. | iOS: ManagedSettings (cu același entitlement). Android: soluție fără Accessibility Service ca scurtătură. |
| Ofertă de lansare (59,99 lei primul an) | **Dezactivată** (`LAUNCH_OFFER.enabled = false`). | Configurată ca ofertă introductivă în magazine. Nu folosim „primii 100” sau countdown-uri. |

---

## Rulare

Cerințe: Node 20+ și npm.

```bash
npm install
npm start            # Metro; deschide în Expo Go (mod manual complet funcțional)
npm run web          # prototip web în browser
```

Verificări:

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # expo lint
npm test             # jest (rulează în fusul orar Europe/Bucharest, cu DST)
npm run build:web    # export static în dist/ (folosit de Vercel)
```

### Development build (pentru modulul Android)

Modulul nativ nu există în Expo Go. Pentru a testa datele automate pe Android:

```bash
npm run android:dev                                   # npx expo run:android (Android SDK local)
npx eas-cli@latest build --profile development -p android   # sau în cloud
```

Folderele `android/` și `ios/` sunt generate și nu sunt versionate. Configurarea nativă se face din `app.json`. Permisiunea `PACKAGE_USAGE_STATS` este deja declarată acolo; utilizatorul o acordă din Setări → Acces la datele de utilizare.

### Versiunea web

`vercel.json` construiește aplicația cu `expo export` și servește `dist/`. **Versiunea web nu poate monitoriza sau bloca alte aplicații.** Funcționează doar cu introducerea manuală, iar datele stau în stocarea browserului.

---

## Arhitectură

```
src/
  app/                      # Expo Router: fiecare fișier este un ecran
    onboarding/             # index (welcome) · goal · apps · limit · source
    (tabs)/                 # index (Acasă) · history (Progres) · pause (Pauză) · settings
    manual-entry.tsx        # introducere / editare / ștergere
    score.tsx               # formula și exemple
    challenges.tsx · paywall.tsx · privacy.tsx · terms.tsx
  components/               # design system: Button, Card, Chip, ChoiceRow, ScoreRing, BarChart, ...
  domain/                   # logică pură, testată: score, stats, usage, pause, plans, challenges, demo, date
  hooks/                    # useToday / useDataView (real vs demo), usePlan, useScreenTimeSync, useReducedMotion
  i18n/                     # ro.ts (implicit, sursa de adevăr) · en.ts
  services/
    screenTime/             # UsageProvider: manual · demo · android (nativ) · ios (indisponibil)
    subscription/           # SubscriptionService + implementare de previzualizare + rezolvarea planului
    exportData.ts · notifications.ts
  store/useAppStore.ts      # Zustand + AsyncStorage, reguli de sursă și deduplicare
  theme/index.ts            # design tokens
modules/usage-stats/        # modul Expo local (Kotlin), doar Android
assets/logo-mark.svg        # logo editabil (+ logo-mark-mono.svg)
```

### Reguli de date

- **O singură sursă pe zi.** Sincronizarea automată nu suprascrie niciodată o zi cu înregistrări manuale. Dacă editezi manual o zi automată, ziua devine manuală (utilizatorul este anunțat în formular).
- **Fără date ≠ 0 minute.** O cheie lipsă înseamnă „nicio înregistrare”; `0` înseamnă „zero minute introduse explicit”.
- **Limita per zi.** Fiecare zi păstrează limita valabilă atunci. Schimbarea obiectivului actualizează doar ziua de azi.
- **Demo** este calculat în memorie și nu este persistat. Exportul conține doar datele reale.

## Design

| Token | Valoare | Rol |
| --- | --- | --- |
| Background / Charcoal / Surface | `#000000` / `#0B0B0F` / `#14141B` | negrul domină |
| Cyan | `#22D3EE` | acțiuni principale |
| Mint | `#34D399` | progres |
| Pink | `#F472B6` | identitate (logo, banner demo) |
| Coral | `#FB7185` | avertizări discrete (peste obiectiv, erori) |
| Text | `#F8FAFC` / `#94A3B8` | principal / secundar |

Fonturi: **Outfit Bold** (titluri) și **Inter** (text), incluse local prin `@expo-google-fonts`. Spațiere pe grilă de 8. Glow doar pe inelul de scor.

## Prețuri (propuse, neactive)

| Regiune | Lunar | Anual |
| --- | --- | --- |
| România | 14,99 lei | 89,99 lei (≈ 7,50 lei/lună, ≈ 50% economie) |
| Zona euro | 3,99 € | 19,99 € |
| SUA | 3,99 USD | 19,99 USD |

Regiunea nu este dedusă din limba interfeței. În producție, prețul afișat trebuie să vină din magazin.

## Confidențialitate

Nu există cont, backend, analytics sau SDK-uri publicitare. Datele stau local (AsyncStorage; pe web, în stocarea browserului), fără criptare proprie. Politica de confidențialitate și termenii din aplicație sunt **drafturi**, nevalidate juridic, cu câmpuri de completat (operator, contact).

## Ce NU este gata de publicare

- Modulul Android nu a fost rulat pe un dispozitiv.
- Nu există plăți și nici verificarea drepturilor Plus.
- Textele juridice sunt draft.
- Iconițele sunt provizorii, generate din SVG.
- Nu s-au făcut teste de accesibilitate cu VoiceOver sau TalkBack pe dispozitive reale.
