# 🚀 DiabetesGuard im Google Play Store veröffentlichen

Komplette Anleitung von Null bis zur Veröffentlichung. **Vorbereitet ist bereits:**
Capacitor-Android-Projekt, Icons/Splash, Release-Signierung in Gradle, GitHub-Actions-Builds,
GitHub-Pages-Hosting, Store-Grafiken, Store-Texte, Play-Console-Antworten, Datenschutz/Impressum,
Onboarding mit medizinischem Hinweis. ✅

---

## Was NUR DU machen kannst (Reihenfolge = Empfehlung)

| # | Schritt | Aufwand | Kosten |
|---|---|---|---|
| 1 | Google Play Developer-Konto + Identitätsprüfung | 30 Min + 1–2 Tage Wartezeit | 25 $ einmalig |
| 2 | Name, Adresse, E-Mail in `public/datenschutz.html` und `public/impressum.html` eintragen | 5 Min | – |
| 3 | GitHub Pages aktivieren (Repo → Settings → Pages → Source „GitHub Actions") | 2 Min | – |
| 4 | Signaturschlüssel erzeugen und als GitHub-Secrets hinterlegen (siehe unten) | 15 Min | – |
| 5 | Debug-APK aus GitHub Actions auf dem Handy testen (Erinnerungen, PDF-Teilen) | 30 Min | – |
| 6 | Store-Eintrag ausfüllen – Texte & Antworten liegen fertig in `store-listing/` | 1–2 Std | – |
| 7 | 12 Tester organisieren, 14 Tage geschlossener Test | 2 Wochen | – |
| 8 | Produktionszugang beantragen, Release einreichen | 30 Min + Review 1–7 Tage | – |

---

## Schritt 1: Google Play Developer-Konto

1. https://play.google.com/console/signup → mit Google-Konto anmelden → **25 $** zahlen
2. Identität verifizieren (Ausweis, dauert 1–2 Tage)

⚠️ **Neue Privatkonten (seit Nov 2023):** Vor der Veröffentlichung muss die App **14 Tage lang
von mindestens 12 Testern** genutzt werden. Freunde/Familie mit Android-Handy reichen.

---

## Schritt 2: Bauen – ohne Android Studio, direkt auf GitHub

Bei jedem Push baut GitHub Actions automatisch (`.github/workflows/android.yml`):

- **Debug-APK** zum Testen: Repo → Actions → letzter Lauf → „Artifacts" → `DiabetesGuard-debug-apk`
  → auf dem Handy installieren („Unbekannte Quellen" erlauben)
- **Release-Bundle (.aab)** für den Play Store – sobald die Secrets aus Schritt 3 existieren

Android Studio brauchst du nur, wenn du lokal debuggen willst (`npx cap open android`).

---

## Schritt 3: Signaturschlüssel (NUR EINMAL – gut sichern!)

Auf deinem PC (Java muss installiert sein, z. B. über Android Studio oder adoptium.net):

```bash
keytool -genkey -v -keystore diabetesguard-release.keystore \
  -alias diabetesguard -keyalg RSA -keysize 2048 -validity 10000
```

⚠️ **Keystore-Datei + Passwort an 2 sicheren Orten aufbewahren!** Ohne diesen Schlüssel
kannst du NIE wieder Updates veröffentlichen.

Dann als GitHub-Secrets hinterlegen (Repo → Settings → Secrets and variables → Actions):

| Secret | Wert |
|---|---|
| `KEYSTORE_BASE64` | Ausgabe von `base64 -w0 diabetesguard-release.keystore` (Windows: `certutil -encode` + Zeilenumbrüche entfernen) |
| `KEYSTORE_PASSWORD` | dein Keystore-Passwort |
| `KEY_ALIAS` | `diabetesguard` |
| `KEY_PASSWORD` | dein Key-Passwort |

Nächster Push → Artifact `DiabetesGuard-release-aab` → `app-release.aab` in die Play Console hochladen.

### Optional: Upload automatisieren (kein manuelles Hochladen mehr)

Einmalig in der Google Cloud Console einen Zugangsschlüssel anlegen, dann landet jeder Build
von allein im internen Test-Track der Play Console:

1. https://console.cloud.google.com → Projekt anlegen (z. B. „DiabetesGuard")
2. „APIs & Dienste" → „Google Play Android Developer API" aktivieren
3. „IAM & Verwaltung" → „Dienstkonten" → „Dienstkonto erstellen" → Name `play-upload`
   → beim Dienstkonto „Schlüssel" → „Neuen Schlüssel erstellen" → JSON → Datei speichern
4. Play Console → „Nutzer und Berechtigungen" → „Neuen Nutzer einladen" → E-Mail des
   Dienstkontos (endet auf `iam.gserviceaccount.com`) → Berechtigung „Releases verwalten"
   für die App vergeben
5. GitHub-Secret `PLAY_SERVICE_ACCOUNT_JSON` = kompletter Inhalt der JSON-Datei

⚠️ Beim allerersten Mal muss ein AAB **manuell** in der Play Console hochgeladen werden
(Google verlangt das, bevor die API freigeschaltet ist). Danach läuft alles automatisch.

*Alternative lokal:* `android/keystore.properties` anlegen (Vorlage siehe unten) und
`cd android && ./gradlew bundleRelease` – die Datei ist per .gitignore ausgeschlossen.

```properties
storeFile=/pfad/zu/diabetesguard-release.keystore
storePassword=DEIN_PASSWORT
keyAlias=diabetesguard
keyPassword=DEIN_PASSWORT
```

---

## Schritt 4: Datenschutzerklärung & Impressum hosten

Nach Aktivieren von GitHub Pages baut `.github/workflows/web-pages.yml` die Web-Version:

- Web-App: `https://master-star1.github.io/diabetesguard/`
- Datenschutz: `https://master-star1.github.io/diabetesguard/datenschutz.html` ← diese URL in die Play Console
- Impressum: `https://master-star1.github.io/diabetesguard/impressum.html`

Vorher die Platzhalter `[IHR NAME]`, `[ADRESSE]`, `[KONTAKT-E-MAIL]` in beiden Dateien ersetzen!

---

## Schritt 5: Store-Eintrag – alles liegt bereit

| Was | Wo |
|---|---|
| App-Name, Kurz- und Langbeschreibung | `store-listing/beschreibung.md` |
| Alle Formular-Antworten (Datensicherheit, Gesundheit, Einstufung …) | `store-listing/play-console-antworten.md` |
| Icon 512×512 | `store-listing/assets/icon-512.png` |
| Feature-Grafik 1024×500 | `store-listing/assets/feature-graphic-1024x500.png` |
| 6 Smartphone-Screenshots 1080×1920 | `store-listing/assets/screenshot-0*.png` |

Formuliere NIEMALS „erkennt Diabetes" – immer „schätzt Ihr Risiko ein". Die Texte beachten das.

---

## Schritt 6: Testen & Veröffentlichen

1. **Interner Test**: AAB hochladen → Link an dich selbst → prüfen
2. **Geschlossener Test** (Pflicht): 12+ Tester per E-Mail-Liste einladen, 14 Tage laufen lassen
3. **Produktionszugang beantragen** → Fragen beantworten (Was macht die App, wie getestet)
4. **Release** im Produktions-Track → Review abwarten (1–7 Tage) → 🎉 live

---

## Updates veröffentlichen (später)

1. Code ändern und pushen → GitHub Actions baut das neue AAB
2. Vorher in `android/app/build.gradle`: `versionCode` um 1 erhöhen (1 → 2) und `versionName` anpassen
3. AAB in der Play Console hochladen

---

## Monetarisierung im Play Store (für später)

Für das Premium-Abo in der Android-App ist **Google Play Billing Pflicht** (Google behält 15 %
bis 1 Mio $ Jahresumsatz). Stripe darf in der Android-App NICHT für das Abo verwendet werden –
nur in der Web-Version. Empfehlung: **RevenueCat** (revenuecat.com) verwaltet Play Billing + Stripe
über eine API, kostenlos bis 2.500 $/Monat Umsatz. Bis dahin die In-App-Produkte in der Console
noch nicht aktivieren.

---

## Vor dem Release auf dem Gerät testen

Diese Funktionen nutzen native Android-Schnittstellen und lassen sich nur auf einem
echten Handy prüfen (nicht im Browser):

| Funktion | So testen |
|---|---|
| **Medikamenten-Erinnerungen** | Medikament mit Uhrzeit in 2 Min. anlegen → „Erinnerungen einschalten" → App schließen → Benachrichtigung muss kommen |
| **PDF-/CSV-Bericht** | Statistik → „PDF-Arztbericht erstellen" → Teilen-Dialog muss erscheinen (z. B. an Google Drive oder E-Mail senden) |
| **Backup einspielen** | Premium-Seite → „Backup einspielen" → Dateiauswahl muss die JSON-Datei annehmen |

Im Play-Console-Formular **„App-Inhalte → Berechtigungen"** wird die Berechtigung
`POST_NOTIFICATIONS` (Android 13+) abgefragt – Begründung: *„Lokale Erinnerungen an
vom Nutzer selbst eingetragene Medikamenteneinnahmen. Keine Werbung, kein Tracking."*

Cloud-Backup ist im Manifest bewusst deaktiviert (`allowBackup="false"`), damit
Gesundheitsdaten nicht automatisch bei Google landen – das passt zur Datenschutzerklärung.

---

## Checkliste vor dem Einreichen

- [ ] Developer-Konto verifiziert
- [ ] Platzhalter in datenschutz.html + impressum.html ersetzt
- [ ] GitHub Pages aktiv, Datenschutz-URL erreichbar
- [ ] Keystore erstellt, doppelt gesichert, Secrets hinterlegt
- [ ] Debug-APK auf echtem Gerät getestet (Erinnerungen, PDF-Teilen, Backup)
- [ ] Release-AAB aus GitHub Actions heruntergeladen
- [ ] Store-Eintrag: Texte, Icon, Feature-Grafik, Screenshots hochgeladen
- [ ] Formulare laut play-console-antworten.md ausgefüllt
- [ ] 12 Tester eingeladen, 14 Tage abgewartet
