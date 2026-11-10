# DiabetesGuard

Blutzucker-Tagebuch, Diabetes-Risikotest, Ernährungsführer und Schwangerschaftsdiabetes-Modus.
Alle Daten bleiben lokal auf dem Gerät – kein Server, kein Konto, kein Tracking.

> DiabetesGuard ist kein Medizinprodukt und ersetzt keine ärztliche Diagnose oder Behandlung.

## Technik

React + TypeScript + Vite + Tailwind, als Android-/iOS-App verpackt mit Capacitor.

```bash
npm ci
npm run dev        # Entwicklungsserver
npm run build      # Produktions-Build nach dist/
npx cap sync       # Web-Build in die nativen Projekte kopieren
```

Premium ist in Version 1.0 ausgeblendet (`PREMIUM_ENABLED` in `src/config.ts`).

## Veröffentlichung

- Android: `PLAY_STORE_GUIDE.md`
- iOS: `APP_STORE_GUIDE.md`
- Store-Texte und Antworten: `store-listing/`
- Pläne nach dem Start: `ROADMAP.md`

Datenschutz und Impressum liegen unter `public/` und werden über GitHub Pages veröffentlicht.
