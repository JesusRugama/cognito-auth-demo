#!/bin/sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
ZIPS="$ROOT/zips"

mkdir -p "$ZIPS"

HANDLERS="endpoint1 endpoint2 endpoint3 endpoint4"

echo "Packaging Lambda handlers..."

for name in $HANDLERS; do
  OUT="$ZIPS/${name}.zip"
  rm -f "$OUT"

  # Handler files at root of zip (junk paths), shared/ as a subdirectory
  (cd "$DIST" && zip -j "$OUT" "$name/index.js" && zip -r "$OUT" shared/)

  echo "✓ ${name}.zip"
done

echo "Done."
