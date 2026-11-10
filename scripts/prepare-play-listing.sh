#!/usr/bin/env bash
# Prüft die Play-Store-Texte (Zeichenlimits) und kopiert die Grafiken aus
# store-listing/assets/ in die Ordnerstruktur, die fastlane supply erwartet.
set -euo pipefail
cd "$(dirname "$0")/.."

META=fastlane/metadata/android/de-DE
ASSETS=store-listing/assets

check() { # Datei, Maximallänge
  local len
  len=$(python3 -c "import sys;print(len(open(sys.argv[1],encoding='utf-8').read().rstrip('\n')))" "$META/$1")
  if [ "$len" -gt "$2" ] || [ "$len" -eq 0 ]; then
    echo "❌ $1: $len Zeichen (erlaubt: 1–$2)"; exit 1
  fi
  echo "✅ $1: $len/$2 Zeichen"
}
check title.txt 30
check short_description.txt 80
check full_description.txt 4000

mkdir -p "$META/images/phoneScreenshots"
cp "$ASSETS/icon-512.png" "$META/images/icon.png"
cp "$ASSETS/feature-graphic-1024x500.png" "$META/images/featureGraphic.png"
n=0
for f in "$ASSETS"/screenshot-0*.png; do
  n=$((n + 1))
  cp "$f" "$META/images/phoneScreenshots/$n.png"
done
[ "$n" -ge 2 ] || { echo "❌ Mindestens 2 Screenshots nötig, gefunden: $n"; exit 1; }
echo "✅ Icon, Feature-Grafik und $n Screenshots bereitgestellt"
