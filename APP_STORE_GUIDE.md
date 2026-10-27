# 🍎 DiabetesGuard im Apple App Store veröffentlichen

Das iOS-Projekt ist fertig vorbereitet: Xcode-Projekt (`ios/`), Icons, Info.plist
(Deutsch, Hochformat, Export-Compliance), App-Privacy-Manifest, GitHub-Actions-Workflow
für Kompilier-Test und TestFlight-Upload, App-Store-Texte und iPhone-Screenshots.

Gleiche App, gleicher Code – nur Verpackung und Store unterscheiden sich.

---

## Was NUR DU machen kannst

| # | Schritt | Aufwand | Kosten |
|---|---|---|---|
| 1 | Apple Developer Program beitreten | 30 Min + 1–2 Tage Prüfung | **99 $ / Jahr** |
| 2 | Kompilier-Test starten: Actions → „iOS Build" → Run workflow (ohne Haken) | 2 Min | – |
| 3 | Zertifikat, Provisioning-Profil und API-Key erzeugen, als Secrets hinterlegen | 45 Min | – |
| 4 | „iOS Build" mit Haken „TestFlight" starten → App auf dem iPhone testen | 20 Min | – |
| 5 | App Store Connect: Eintrag anlegen, Texte/Screenshots hochladen, Datenschutz-Fragen | 1–2 Std | – |
| 6 | Zur Prüfung einreichen | 10 Min + Review 1–3 Tage | – |

**Kein Mac nötig** – alles läuft über GitHubs macOS-Runner. Ein Mac wäre nur zum lokalen
Debuggen praktisch (`npx cap open ios`).

⚠️ Kein Zwangstest mit 12 Testern wie bei Google. Dafür prüft Apple strenger auf
Gesundheits-Regeln (Guideline 1.4.1 und 5.1.3) – unsere Disclaimer und die
„nur lokal"-Architektur sind genau dafür gebaut.

---

## Schritt 1: Apple Developer Program

https://developer.apple.com/programs/enroll/ → mit Apple-ID anmelden → **99 $/Jahr** →
Identität wird geprüft (1–2 Tage). Danach hast du Zugang zu App Store Connect.

## Schritt 2: Kompilier-Test (sofort möglich, ohne Apple-Konto)

Repo → Actions → **iOS Build** → „Run workflow" → Haken **nicht** setzen → Start.
Nach ~10 Min steht „✅ iOS-Projekt kompiliert" im Log. Damit ist bewiesen, dass das
Xcode-Projekt mit allen Plugins baut.

## Schritt 3: Signierung einrichten (einmalig)

Alles in https://developer.apple.com/account und https://appstoreconnect.apple.com:

1. **App-ID anlegen**: Certificates, IDs & Profiles → Identifiers → „+" → App IDs →
   Bundle ID `de.diabetesguard.app` (muss exakt so heißen)
2. **Distribution-Zertifikat**: Certificates → „+" → „Apple Distribution". Dafür brauchst
   du einmalig eine Zertifikatsanfrage (.certificateSigningRequest) – ohne Mac geht das mit
   OpenSSL:
   ```bash
   openssl genrsa -out apple.key 2048
   openssl req -new -key apple.key -out apple.csr -subj "/emailAddress=DEINE@MAIL/CN=DEIN NAME/C=DE"
   ```
   `apple.csr` hochladen → `distribution.cer` herunterladen → zu .p12 bündeln:
   ```bash
   openssl x509 -in distribution.cer -inform DER -out distribution.pem
   openssl pkcs12 -export -inkey apple.key -in distribution.pem -out distribution.p12
   ```
3. **Provisioning-Profil**: Profiles → „+" → „App Store Connect" → App-ID wählen →
   Zertifikat wählen → herunterladen (`.mobileprovision`)
4. **API-Key**: App Store Connect → Users and Access → Integrations → App Store Connect API
   → „+" → Rolle „App Manager" → `.p8` herunterladen (nur EINMAL möglich!), Key-ID und
   Issuer-ID notieren
5. **Team-ID**: developer.apple.com/account → Membership details

Als GitHub-Secrets hinterlegen (Repo → Settings → Secrets and variables → Actions):

| Secret | Inhalt |
|---|---|
| `APPLE_CERT_P12_BASE64` | `base64 -w0 distribution.p12` |
| `APPLE_CERT_PASSWORD` | das beim Export gewählte Passwort |
| `APPLE_PROVISION_BASE64` | `base64 -w0 profil.mobileprovision` |
| `APPSTORE_KEY_ID` | z. B. `AB12CD34EF` |
| `APPSTORE_ISSUER_ID` | UUID aus App Store Connect |
| `APPSTORE_KEY_P8_BASE64` | `base64 -w0 AuthKey_XXXX.p8` |
| `APPLE_TEAM_ID` | 10 Zeichen |

⚠️ `apple.key`, `.p12` und `.p8` genauso sichern wie den Android-Keystore.

## Schritt 4: TestFlight

Actions → **iOS Build** → Run workflow → Haken **„TestFlight"** setzen. Nach ~15 Min
erscheint der Build in App Store Connect → TestFlight. Dort dich selbst als Tester eintragen,
TestFlight-App auf dem iPhone installieren, App laden.

Auf dem Gerät prüfen: Erinnerungen (iOS fragt beim ersten Mal nach Erlaubnis), PDF-Teilen
(öffnet das iOS-Share-Sheet), Backup einspielen (Dateien-App), Safe-Area bei Notch.

## Schritt 5: App Store Connect – Eintrag

„Meine Apps" → „+" → Neue App → Plattform iOS, Name **DiabetesGuard**, Sprache Deutsch,
Bundle-ID wählen, SKU `diabetesguard-ios`.

| Was | Wo |
|---|---|
| Texte (Name, Untertitel, Beschreibung, Keywords) | `store-listing/app-store-connect-antworten.md` |
| Antworten auf alle Datenschutz- und Review-Fragen | ebenda |
| iPhone-Screenshots 6,7" (1290×2796) | `store-listing/assets/ios-screenshot-0*.png` |
| App-Icon 1024×1024 | `store-listing/assets/icon-1024.png` (wird auch automatisch aus dem Build gelesen) |
| Datenschutz-URL | `https://master-star1.github.io/diabetesguard/datenschutz.html` |
| Support-URL | `https://master-star1.github.io/diabetesguard/impressum.html` |

## Schritt 6: Einreichen

Build aus TestFlight auswählen → Altersfreigabe (Fragebogen → 4+ oder 12+ wegen
„Medizinische Informationen") → „Zur Prüfung einreichen". Apple prüft meist in 24–72 Std.

**Typische Ablehnungsgründe bei Gesundheits-Apps und warum wir sie vermeiden:**
- *„App stellt medizinische Diagnosen"* → wir sagen überall „Risikoeinschätzung", Disclaimer im Onboarding
- *„Gesundheitsdaten werden ohne Zustimmung erhoben"* → nichts verlässt das Gerät, Privacy-Manifest sagt „keine Datenerhebung"
- *„Abo-Bedingungen unklar"* → siehe Hinweis unten
- *„Login-Pflicht ohne Grund"* → wir haben keinen Login

---

## Premium-Abo auf iOS (für später)

Wie bei Google gilt: **Apple In-App-Kauf ist Pflicht** für digitale Inhalte (Apple behält
15 % im Small Business Program bis 1 Mio $ Umsatz). Stripe ist in der iOS-App nicht erlaubt.
RevenueCat deckt Apple + Google + Stripe(Web) mit einer Integration ab.
Bis das eingebaut ist, die Abos in App Store Connect noch nicht anlegen – Apple lehnt Apps ab,
bei denen sichtbare Preise nicht über In-App-Kauf funktionieren. Deshalb: Vor dem
Einreichen entweder RevenueCat integrieren **oder** die Premium-Seite für den iOS-Build
vorübergehend ausblenden (Hinweis dazu in `store-listing/app-store-connect-antworten.md`).

---

## Updates

1. Code ändern, pushen
2. In Xcode-Projekt Version erhöhen: `ios/App/App.xcodeproj/project.pbxproj` →
   `MARKETING_VERSION` (z. B. 1.0 → 1.1) und `CURRENT_PROJECT_VERSION` (1 → 2)
   – beides kommt je zweimal vor (Debug + Release)
3. „iOS Build" mit TestFlight-Haken starten → neuer Build erscheint in App Store Connect
