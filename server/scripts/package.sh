#!/bin/sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ZIPS="$ROOT/zips"

mkdir -p "$ZIPS"

HANDLERS="endpoint1 endpoint2 endpoint3 endpoint4 pre-auth authorizer"

echo "Bundling and packaging Lambda handlers..."

for name in $HANDLERS; do
  OUT="$ZIPS/${name}.zip"
  rm -f "$OUT"

  "$ROOT/node_modules/.bin/esbuild" \
    "$ROOT/src/$name/index.ts" \
    --bundle \
    --platform=node \
    --target=node20 \
    --outfile="$ZIPS/$name/index.js" \
    --external:aws-sdk

  (cd "$ZIPS/$name" && zip -j "$OUT" index.js)
  rm -rf "$ZIPS/$name"

  echo "✓ ${name}.zip"
done

echo "Done."
