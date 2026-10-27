# Roadmap – nach der Veröffentlichung

Stand: September 2026. Reihenfolge = Empfehlung nach Nutzen und Aufwand.

## Version 1.1 – Bezahlen & Bluetooth

### 💳 Abo über Play Billing / Apple In-App-Kauf (Pflicht vor Monetarisierung)
- RevenueCat integrieren (Play + App Store + Stripe/Web in einer API)
- Premium-Status serverseitig prüfen statt nur lokal (aktuell manipulierbar)
- In den Stores Produkte `premium_monthly` (4,99 €) und `premium_yearly` (39,99 €) anlegen
- Bis dahin: iOS-Release entweder mit ausgeblendeter Premium-Seite oder alles kostenlos

### 📡 Blutzuckermessgerät per Bluetooth (Premium-Feature)
- Plugin `@capacitor-community/bluetooth-le` (Android, iOS, Chrome-Web)
- Bluetooth-Standardprofil „Glucose Service" (0x1808): Glucose Measurement (0x2A18),
  Record Access Control Point (0x2A52) – „alle Datensätze seit Sequenznummer X"
- Unterstützte Geräte (Standardprofil): Accu-Chek Guide/Instant, Contour Next One,
  Beurer GL 50 evo u. a. – NICHT: OneTouch (proprietär), FreeStyle Libre
- Import-Ansicht: neue Werte anzeigen, Messzeitpunkt per Uhrzeit vorschlagen,
  Doppelte über Sequenznummer erkennen, Gerät merken
- Berechtigungen: Android `BLUETOOTH_SCAN`/`BLUETOOTH_CONNECT`, iOS
  `NSBluetoothAlwaysUsageDescription` – in beiden Store-Formularen begründen
- Simulator-Modus für Tests ohne Gerät; echter Test braucht ein physisches Messgerät
- Aufwand ca. 2–3 Tage + Gerätetests

## Version 1.2 – Alltag

- 💓 **Blutdruck-Tracking** (Standard-Ko-Parameter bei Typ 2 und in der Schwangerschaft)
- 📱 **Homescreen-Widget** für Schnelleingabe (Diabetes:M-Nutzer loben das explizit)
- 🍽️ **Lebensmittel-Datenbank** mit Kohlenhydratangaben (z. B. Open Food Facts, offline-Teilmenge)
- 🔔 **Mess-Erinnerungen** („2 h nach Mahlzeit messen" automatisch nach Mahlzeit-Eintrag)
- 🔗 **Affiliate-Links** in `src/data/pregnancy.ts` eintragen, sobald Partnerprogramm aktiv

## Später / strategisch

- 🏥 **DiGA-Zulassung** (App auf Rezept): Medizinprodukt Klasse I, BfArM-Verfahren,
  Nutzenstudie – Kosten 100–300 k€, danach 200–500 € pro Patient und Quartal
- 🏢 **Betriebliches Gesundheitsmanagement**: Firmenlizenzen
- 👨‍👩‍👧 **Mehrere Profile** (Angehörige)
- 🌍 **Englische Übersetzung** (verdoppelt den Markt, i18n-Struktur vorbereiten)
- 🌙 **Dark Mode**
