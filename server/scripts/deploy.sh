#!/bin/sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ZIPS="$ROOT/zips"

if [ -z "$S3_BUCKET" ]; then
  echo "Error: S3_BUCKET environment variable is not set."
  exit 1
fi

REGION="${AWS_REGION:-us-east-1}"
HANDLERS="endpoint1 endpoint2 endpoint3 endpoint4"

echo "Deploying Lambda zips to s3://$S3_BUCKET/server/..."

for name in $HANDLERS; do
  ZIP="$ZIPS/${name}.zip"
  S3_KEY="s3://$S3_BUCKET/server/${name}.zip"
  FUNCTION_NAME="cognito-scopes-demo-${name}"

  aws s3 cp "$ZIP" "$S3_KEY"
  echo "✓ Uploaded $S3_KEY"

  # aws lambda update-function-code \
  #   --function-name "$FUNCTION_NAME" \
  #   --s3-bucket "$S3_BUCKET" \
  #   --s3-key "server/${name}.zip" \
  #   --region "$REGION" \
  #   --output text
  echo "✓ Updated Lambda: $FUNCTION_NAME"
done

echo "Done."
