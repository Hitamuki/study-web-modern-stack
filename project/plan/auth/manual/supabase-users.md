---
type: Runbook
title: 検証用ユーザーを 2 人作る
description: Supabase Auth に確認済みユーザーを 2 人作る。行レベル権限の分離を検証するため 2 人必要。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/74
tags: [auth, supabase, 人間の作業, 手順書]
status: stable
stale_after: 2026-09-23
generated: { by: claude-code/claude-fable-5, at: 2026-08-23T00:00:00Z }
---

# なぜ 2 人必要か

Issue [#22](https://github.com/Hitamuki/study-web-modern-stack/issues/22) の AC が
**「別ユーザーの JWT で他人のレコードが取得できない」**を要求しているため。1 人では確かめられません。

# なぜサインアップ画面から作れないか

プロジェクトは `mailer_autoconfirm: false`（メール確認が必須）で、
**Supabase の組み込みメールは組織メンバー宛にしか届かず、上限は 2 通/時**です（Issue #71）。
サインアップすると確認待ちのまま進めなくなります。

**確認済みの状態で直接作る**必要があります。方法は 3 つあり、上から順に安全です。

---

# 方法 A: ダッシュボード（推奨・秘匿値を扱わない）

1. Supabase ダッシュボード → **Authentication → Users**
2. **Add user → Create new user**
3. Email と Password を入力し、**「Auto Confirm User」にチェック**
4. 同じ手順をもう 1 人分

チェックを入れ忘れると未確認のまま作られ、ログインできません。その場合は作り直してください。

**作成後、一覧に出る各ユーザーの UUID を控えます**（手順 4 で使います）。

---

# 方法 B: SQL（一括で作りたいとき）

`project/plan/auth/manual/seed-auth-users.sql` をダッシュボードの **SQL Editor** に貼って実行します。
冒頭の `users` 配列を書き換えてから流してください。

> [!WARNING]
> **実行先は Supabase プロジェクトのデータベースです。** リポジトリの `docker-compose` の PostgreSQL ではありません。
> `auth` スキーマは Supabase 側にしか存在しないため、`apps/api/prisma/seed.sql` とは**別物**です。
> 既存の `make db-seed` はローカルの `dummy` テーブル用で、ユーザーは作れません。

パスワードは `crypt(password, gen_salt('bf'))` で Blowfish（bcrypt）ハッシュにしています。
**平文を入れるとログインできません。**

`auth.users` だけでなく **`auth.identities` にも行が要ります**。近年の Supabase は identities が無いとサインインに失敗します。

> [!NOTE]
> Supabase 公式は `auth` スキーマへの直接 INSERT を推奨していません（Auth API の利用を推奨）。
> **検証用ユーザーを手早く作る用途に限って**使い、本番のユーザー作成に流用しないでください。

スクリプト末尾の `select` で作成された `id` が出ます。これを控えます。

---

# 方法 C: Admin API（スクリプトから作りたいとき）

**service_role キーが要ります。これは全権を持つ秘匿値で、絶対にコミットしないでください。**

```bash
export SUPABASE_SERVICE_ROLE_KEY='...'   # ダッシュボードの Project Settings > API Keys
curl -s -X POST "https://kdhyeuasgxdlkzwqfbij.supabase.co/auth/v1/admin/users" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"email":"test-a@example.com","password":"test1234","email_confirm":true}' | jq '{id, email}'
```

`email_confirm: true` が「確認済みとして作る」指定です。

---

# 完了の確認

作った 2 人でトークンを取得できることを確かめます。

```bash
curl -s -X POST "https://kdhyeuasgxdlkzwqfbij.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY" -H 'Content-Type: application/json' \
  -d '{"email":"test-a@example.com","password":"test1234"}' | jq -r '.access_token // .msg'
```

`invalid_credentials` が返る場合、ユーザーが未作成か、未確認か、パスワードが違います。

**次は [verify-hook.md](/project/plan/auth/manual/verify-hook.md) です。**
