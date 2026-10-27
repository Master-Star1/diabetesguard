# Play Console – Antworten zum Abtippen

Alle Pflichtformulare der Play Console, vorausgefüllt für DiabetesGuard.
Reihenfolge wie in der Console unter **„App-Inhalte"**.

---

## 1. Datenschutzerklärung
URL eintragen, sobald GitHub Pages aktiv ist (Repo → Settings → Pages → Source „GitHub Actions“):
`https://master-star1.github.io/diabetesguard/datenschutz.html`
(Name, Adresse und E-Mail sind in Datenschutz und Impressum bereits eingetragen.)

## 2. Werbung
**Enthält meine App Werbung?** → **Nein**
(Affiliate-Links zu physischen Produkten gelten nicht als Werbe-SDK. Sie sind in der App als „Anzeige" gekennzeichnet – das genügt Google und dem deutschen Wettbewerbsrecht.)

## 3. App-Zugriff
**Sind Teile der App eingeschränkt (Login, Abo)?**
→ „Alle Funktionen sind ohne besonderen Zugriff verfügbar"
(Version 1.0 ist komplett kostenlos, es gibt weder Login noch Abo – alle Funktionen sind frei.)

## 4. Inhaltseinstufung (IARC-Fragebogen)
- Kategorie: **Dienstprogramm / Produktivität / Sonstige**
- Gewalt, Sexualität, Drogen, Glücksspiel, Schimpfwörter: **alle Nein**
- Nutzerinteraktion / Standortfreigabe / Kaufmöglichkeiten: Nein / Nein / **Nein** (erst mit Version 1.1 und Play Billing auf Ja ändern)
→ Ergebnis: USK 0 / PEGI 3

## 5. Zielgruppe und Inhalte
- Zielgruppe: **18 und älter** (vereinfacht die Prüfung; Kinder sind keine Zielgruppe)
- „Könnte die App unbeabsichtigt Kinder ansprechen?" → Nein

## 6. Datensicherheit (wichtigstes Formular)
**Erhebt oder teilt Ihre App Nutzerdaten?** → **Nein**

Begründung, falls Rückfrage: Alle eingegebenen Gesundheitsdaten werden ausschließlich im
lokalen App-Speicher des Geräts abgelegt. Es existiert kein Server, kein Konto, keine Analyse-
oder Werbe-SDKs. Die App sendet keine Daten – auch nicht an den Entwickler. Cloud-Backup ist
im Manifest deaktiviert (`allowBackup="false"`).

Weitere Fragen im Formular:
- Daten verschlüsselt übertragen? → Nicht zutreffend (keine Übertragung)
- Können Nutzer Löschung beantragen? → **Ja** (in der App: „Alle Daten löschen"; zusätzlich Deinstallation)
- Unabhängige Sicherheitsprüfung? → Nein

## 7. Gesundheits-Apps
- **Enthält die App Gesundheitsfunktionen?** → Ja
- Kategorie: **„Verwaltung von Gesundheitsdaten / Tagebuch"** und **„Gesundheitsinformationen"**
- **Ist die App ein Medizinprodukt (CE / FDA)?** → **Nein**
- **Verspricht die App Diagnosen?** → Nein – der Risikotest ist eine Orientierungshilfe mit
  Arzt-Verweis, die HbA1c-Anzeige eine gekennzeichnete rechnerische Schätzung

## 8. Berechtigungen
- `POST_NOTIFICATIONS`: „Lokale Erinnerungen an vom Nutzer selbst eingetragene
  Medikamenteneinnahmen. Optional, jederzeit abschaltbar."
- `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM` (falls abgefragt): „Erinnerungen zur exakten
  Einnahmezeit – Kernfunktion der Medikamenten-Erinnerung."

## 9. Staatliche Apps / Finanzdienste / Nachrichten-Apps
→ jeweils **Nein**

## 10. Store-Eintrag
Texte aus `beschreibung.md`, Grafiken aus `assets/`:
| Asset | Datei |
|---|---|
| App-Symbol 512×512 | `assets/icon-512.png` |
| Feature-Grafik 1024×500 | `assets/feature-graphic-1024x500.png` |
| Smartphone-Screenshots (min. 2, max. 8) | `assets/screenshot-01.png` … `screenshot-06.png` |

Kategorie: **Gesundheit & Fitness** · Tags: Diabetes, Blutzucker, Tagebuch, Ernährung, Schwangerschaftsdiabetes
Kontakt-E-Mail: diabetesguardinfo@gmail.com (Pflicht, wird öffentlich angezeigt)

## 11. Preisgestaltung
- App: **Kostenlos**
- In-App-Produkte anlegen (Monetarisierung → Produkte → Abos):
  - `premium_monthly` – 4,99 € / Monat
  - `premium_yearly` – 39,99 € / Jahr
  → Für Version 1.0 NICHT anlegen: Die Premium-Funktionen sind ausgeblendet (`PREMIUM_ENABLED = false`
    in `src/config.ts`). Erst mit Version 1.1 und eingebautem Play Billing anlegen, dann auch
    „Kaufmöglichkeiten“ im Inhaltsfragebogen auf Ja setzen.
