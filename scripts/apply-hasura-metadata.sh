#!/usr/bin/env bash
# Hasura にメタデータ（カスタム型・createMemo Action）を適用する。
# リポジトリルートから実行: ./scripts/apply-hasura-metadata.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

HASURA_URL="${HASURA_URL:-http://localhost:8080}"
HASURA_ADMIN_SECRET="${HASURA_ADMIN_SECRET:-myadminsecretkey}"

echo "Applying Hasura metadata (HASURA_URL=$HASURA_URL)..."

curl -sS -X POST "$HASURA_URL/v1/metadata" \
  -H "Content-Type: application/json" \
  -H "X-Hasura-Admin-Secret: $HASURA_ADMIN_SECRET" \
  -d @"$REPO_ROOT/apps/api/hasura/metadata/set_custom_types_createMemo.json"

echo ""
echo "Custom types applied."

curl -sS -X POST "$HASURA_URL/v1/metadata" \
  -H "Content-Type: application/json" \
  -H "X-Hasura-Admin-Secret: $HASURA_ADMIN_SECRET" \
  -d @"$REPO_ROOT/apps/api/hasura/metadata/create_action_createMemo.json"

echo ""
echo "Action createMemo created. Done."
