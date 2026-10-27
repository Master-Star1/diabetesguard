# App Store Connect – Texte und Antworten zum Abtippen

## Store-Eintrag

**Name (max. 30):** `DiabetesGuard`
**Untertitel (max. 30):** `Tagebuch, Risikotest, Schwangerschaft`
**Kategorie:** Gesundheit & Fitness · Zweitkategorie: Medizin
**Keywords (max. 100 Zeichen, kommagetrennt, ohne Leerzeichen):**
```
Diabetes,Blutzucker,Tagebuch,HbA1c,Schwangerschaftsdiabetes,Prädiabetes,Ernährung,Glukose,Gewicht
```
**Werbetext (max. 170, änderbar ohne Review):**
```
Neu: Musteranalyse erkennt, was Ihren Blutzucker treibt – Wochentage, Mahlzeiten, Sport, Stress. Plus PDF-Arztbericht und Medikamenten-Erinnerungen.
```
**Beschreibung:** identisch mit Google – siehe `beschreibung.md` (Apple erlaubt 4000 Zeichen, keine Emojis in Überschriften nötig, aber erlaubt)

**Support-URL:** `https://master-star1.github.io/diabetesguard/impressum.html`
**Datenschutz-URL:** `https://master-star1.github.io/diabetesguard/datenschutz.html`
**Copyright:** `© 2026 Adrian Mollenhauer`

## App-Datenschutz („Nutrition Label")

**Erhebt diese App Daten?** → **Nein, es werden keine Daten erhoben**

Begründung (falls Apple nachfragt): Alle Gesundheitsdaten werden ausschließlich lokal im
App-Speicher des Geräts abgelegt. Kein Server, kein Konto, keine Analyse-/Werbe-SDKs, kein
Tracking. Das App-Privacy-Manifest (`PrivacyInfo.xcprivacy`) deklariert entsprechend
`NSPrivacyTracking = false` und keine gesammelten Datentypen.

## Altersfreigabe (Fragebogen)

- Medizinische/Behandlungsinformationen: **Selten/Mild** → ergibt 12+
- Alles andere (Gewalt, Sex, Glücksspiel, Drogen …): **Nein**
- Uneingeschränkter Webzugriff: Nein

## Review-Informationen

**Anmeldedaten nötig?** → Nein (kein Login)
**Notizen für das Review-Team:**
```
DiabetesGuard ist ein Blutzucker-Tagebuch mit Risiko-Selbsttest und Ernährungstipps
für Menschen mit Typ-2-Diabetes oder Prädiabetes.

- Kein Medizinprodukt: Die App stellt keine Diagnosen und gibt keine Dosierungs-
  empfehlungen. Der Risikotest ist eine Orientierungshilfe mit Arzt-Verweis, die
  HbA1c-Anzeige eine gekennzeichnete rechnerische Schätzung (ADAG-Formel).
- Alle Daten bleiben lokal auf dem Gerät. Kein Konto, kein Server, kein Tracking.
- Beim ersten Start muss der medizinische Hinweis aktiv bestätigt werden.
- Benachrichtigungen (optional) erinnern nur an selbst eingetragene Medikamente.
- Zum Testen aller Funktionen: Tab „Blutzucker" → „+ Messen" einige Werte eintragen,
  dann „Statistik" für Auswertungen und PDF-Export.
```

## Export-Compliance
Bereits in Info.plist beantwortet (`ITSAppUsesNonExemptEncryption = false`) – die Frage
erscheint beim Upload nicht mehr.

## ✅ Premium-Seite: für Version 1.0 bereits ausgeblendet

Erledigt: Option B ist umgesetzt (`PREMIUM_ENABLED = false` in `src/config.ts`), der erste Release ist komplett kostenlos. Die Optionen unten gelten für Version 1.1.

Apple lehnt Apps ab, die Preise anzeigen, ohne dass der Kauf über Apple In-App-Kauf
funktioniert. Zwei Optionen:

**A) RevenueCat integrieren** (empfohlen, ca. 1 Tag Arbeit) – dann Abos in App Store Connect
anlegen: `premium_monthly` 4,99 €, `premium_yearly` 39,99 €, Gruppe „Premium".

**B) Für den ersten iOS-Release Premium ausblenden** – in `src/App.tsx` alle Nutzer als
Premium behandeln, wenn die App nativ läuft. Dann ist der erste Release komplett kostenlos
und die Monetarisierung folgt mit Update 1.1. Vorteil: schnellerer Start, erste Bewertungen.

## Screenshots

| Gerät | Datei | Pflicht |
|---|---|---|
| iPhone 6,7" (1290×2796) | `assets/ios-screenshot-01…06.png` | ja |
| iPhone 6,5" (1284×2778) | Apple skaliert die 6,7"-Bilder automatisch | nein |
| iPad 13" | nur nötig, wenn iPad-Unterstützung aktiv bleibt – sonst in Xcode „iPhone only" wählen | optional |
