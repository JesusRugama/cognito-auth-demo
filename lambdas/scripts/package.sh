#!/bin/sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ZIPS="$ROOT/zips"

mkdir -p "$ZIPS"

API_HANDLERS="endpoint1 endpoint2 endpoint3 endpoint4"
COGNITO_HANDLERS="pre-auth authorizer"

echo "Bundling and packaging Lambda handlers..."

for name in $API_HANDLERS; do
  OUT="$ZIPS/${name}.zip"
  rm -f "$OUT"

  "$ROOT/node_modules/.bin/esbuild" \
    "$ROOT/src/api/$name/index.ts" \
    --bundle \
    --platform=node \
    --target=node20 \
    --outfile="$ZIPS/$name/index.js" \
    --external:aws-sdk

  (cd "$ZIPS/$name" && zip -j "$OUT" index.js)
  rm -rf "$ZIPS/$name"

  echo "✓ ${name}.zip"
done

for name in $COGNITO_HANDLERS; do
  OUT="$ZIPS/${name}.zip"
  rm -f "$OUT"

  "$ROOT/node_modules/.bin/esbuild" \
    "$ROOT/src/cognito/$name/index.ts" \
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