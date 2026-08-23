#!/usr/bin/env bash
# Supabase Auth に検証用ユーザーを作る（Admin API 経由）。
#
# ホストされた Supabase では postgres ロールが auth.users の所有者ではないため、
# SQL による直接 INSERT はできない（ERROR 42501: must be owner of table users）。
# 公式に用意された経路である Admin API を使う。
#
# 使い方:
#   export SUPABASE_SERVICE_ROLE_KEY='...'   # Project Settings > API Keys
#   ./create-test-users.sh a@example.com b@example.com
#
# service_role キーは**全権**を持つ秘匿値。コミットしないこと。
# 履歴に残さないため、export ではなく `read -rs` での入力を推奨する。
set -euo pipefail

PROJECT_REF="${SUPABASE_PROJECT_REF:-kdhyeuasgxdlkzwqfbij}"
: "${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY が未設定です。Project Settings > API Keys から取得してください}"

if [ $# -eq 0 ]; then
  set -- "test-a@example.com" "test-b@example.com"
fi

API="https://${PROJECT_REF}.supabase.co/auth/v1/admin/users"

printf '%-32s %-26s %s\n' "email" "password" "user_id"
printf '%-32s %-26s %s\n' "--------------------------------" "--------------------------" "------------------------------------"

for email in "$@"; do
  # パスワードはここで生成する。ファイルにもコマンド履歴にも残さない。
  password="$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 24)"

  response="$(curl -s -X POST "$API" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H 'Content-Type: application/json' \
    -d "$(printf '{"email":%s,"password":%s,"email_confirm":true}' \
          "$(printf '%s' "$email" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')" \
          "$(printf '%s' "$password" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')")")"

  id="$(printf '%s' "$response" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("id",""))' 2>/dev/null || true)"

  if [ -z "$id" ]; then
    msg="$(printf '%s' "$response" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("msg") or d.get("error_description") or d.get("message") or "")' 2>/dev/null || true)"
    printf '%-32s %s\n' "$email" "作成できませんでした: ${msg:-$response}" >&2
    continue
  fi

  # email_confirm: true を指定しているので確認メールは飛ばない
  printf '%-32s %-26s %s\n' "$email" "$password" "$id"
done

cat <<'NOTE'

上の password と user_id を控えてください。password はここでしか表示されません。
user_id は手順 4（シードの所有者の差し替え）で使います。
NOTE
