---
type: Runbook
title: 検証用ユーザーを 2 人作る
description: Supabase Auth に確認済みユーザーを 2 人作る。行レベル権限の分離を検証するため 2 人必要。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/74
tags: [auth, supabase, 人間の作業, 手順書, 完了]
status: stable
stale_after: 2026-09-23
generated: { by: claude-code/claude-fable-5, at: 2026-08-23T00:00:00Z }
verified:
  - { by: human:Hitamuki, at: 2026-08-23T00:00:00Z }
---

> [!NOTE]
> **この手順は完了済みです**（2026-08-23、ダッシュボードで作成）。
> 作成した値は `.env` の `SUPABASE_USER_*` に控えてあります（`.gitignore` 済み）。
> 以下は再実施や、ユーザーを追加するときのための記録です。

> [!CAUTION]
> **メールアドレスもパスワードもリポジトリ内のファイルに書かないでください。**
> このリポジトリは公開されており、一度コミットすると履歴から消えません。
> 控えるのは `.env`（`.gitignore` 済み）かパスワードマネージャにしてください。

# なぜ 2 人必要か

Issue [#22](https://github.com/Hitamuki/study-web-modern-stack/issues/22) の AC が
**「別ユーザーの JWT で他人のレコードが取得できない」**を要求しているため。1 人では確かめられません。

# なぜサインアップ画面から作れないか

プロジェクトは `mailer_autoconfirm: false`（メール確認が必須）で、
**Supabase の組み込みメールは組織メンバー宛にしか届かず、上限は 2 通/時**です（Issue #71）。
サインアップすると確認待ちのまま進めなくなります。**確認済みの状態で直接作る**必要があります。

# 手順: ダッシュボードで作る

1. Supabase ダッシュボード → **Authentication → Users**
2. **Add user → Create new user**
3. Email と Password を入力し、**「Auto Confirm User」にチェック**
4. 同じ手順をもう 1 人分

チェックを入れ忘れると未確認のまま作られ、ログインできません。その場合は作り直してください。

**作成後、一覧に出る各ユーザーの UUID を控えます**（[reseed.md](/project/plan/auth/manual/reseed.md) で使います）。

# すでにユーザーを作ってある場合

パスワードだけ変えたいときは、作り直さずに変更できます。

> ダッシュボード → **Authentication → Users** → 対象のユーザー → **Reset password** / **Update password**

# SQL による直接 INSERT は使えない（試して失敗した記録）

当初 `auth.users` へ直接 INSERT する SQL を用意しましたが、**ホストされた Supabase では動きません。**

```text
ERROR: 42501: must be owner of table users
```

`postgres` ロールは `auth.users` の所有者ではなく、これは **Auth サービスが壊れる変更を防ぐための
意図的なプラットフォーム制限**です。回避策はありません。

スーパーユーザー権限のあるセルフホストや Supabase CLI のローカルスタックでは動きますが、
本プロジェクトはクラウドのプロジェクトを使う方針（Discussion #19）なので採れません。

> [!IMPORTANT]
> **教訓: 外部サービスの権限モデルは、模した環境では検証できません。**
> ローカルに `auth` スキーマを自作して SQL を検証していましたが、テーブル構造は再現できても
> 所有者とロールは本番と違うため、この制限だけは再現できませんでした。

Admin API（`POST /auth/v1/admin/users` に `email_confirm: true`）を使うスクリプトも用意しましたが、
**service_role キー（全権）の取り回しが必要**で、2 人作るだけならダッシュボードのほうが安全なため削除しました。
繰り返し大量に作る必要が出たら、そのときに作り直します。

# 完了の確認

作った 2 人でトークンを取得できることを確かめます。

```bash
set -a && . ./.env && set +a
curl -s -X POST "https://${SUPABASE_PROJECT_REF}.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_PUBLISHABLE_KEY}" -H 'Content-Type: application/json' \
  -d "{\"email\":\"${SUPABASE_USER_EMAIL_1}\",\"password\":\"${SUPABASE_USER_PASSWORD_1}\"}" \
  | jq -r '.access_token // .msg'
```

`invalid_credentials` が返る場合、未確認かパスワードが違います。

**次は [verify-hook.md](/project/plan/auth/manual/verify-hook.md) です。**
