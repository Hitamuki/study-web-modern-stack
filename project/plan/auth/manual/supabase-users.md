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

> [!CAUTION]
> **パスワードをリポジトリ内のファイルに書かないでください。** このリポジトリは公開されており、
> 一度コミットすると履歴から消えません。手順中のコマンドは環境変数で受け取る形にしてあります。
>
> ```bash
> export TEST_EMAIL='test-a@example.com'
> read -rs TEST_PASSWORD && export TEST_PASSWORD   # 画面に出さずに入力する
> ```
>
> シェルの履歴にも残さないよう `read -rs` を使ってください。

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

# 方法 B: スクリプト（一括で作りたいとき）

[create-test-users.sh](/project/plan/auth/manual/create-test-users.sh) を使います。
**メールアドレスは引数で渡します。**ファイルに書かないため、個人のアドレスがリポジトリに残りません。

```bash
read -rs SUPABASE_SERVICE_ROLE_KEY && export SUPABASE_SERVICE_ROLE_KEY
./project/plan/auth/manual/create-test-users.sh you@example.com other@example.com
```

出力はこの形です。**閉じる前に password と user_id を控えてください。**

```text
email                            password                   user_id
-------------------------------- -------------------------- ------------------------------------
you@example.com                  A1b2C3d4E5f6G7h8I9j0K1l2   0fb3ac59-...
```

パスワードはスクリプトが生成し、ファイルにもコマンド履歴にも残りません。
`email_confirm: true` を指定しているので**確認メールは飛びません**。

> [!CAUTION]
> **service_role キーは全権を持つ秘匿値です。** コミットしないのはもちろん、
> `export SUPABASE_SERVICE_ROLE_KEY='...'` と直接打つとシェル履歴に残ります。
> 上記のように `read -rs` で入力してください。

## SQL による直接 INSERT は使えない

当初 `auth.users` へ直接 INSERT する SQL を用意しましたが、**ホストされた Supabase では動きません。**

```text
ERROR: 42501: must be owner of table users
```

`postgres` ロールは `auth.users` の所有者ではなく、これは**意図的なプラットフォーム制限**です
（Auth サービスが壊れる変更を防ぐため）。スーパーユーザー権限のあるセルフホストや
Supabase CLI のローカルスタックでは動きますが、本プロジェクトはクラウドのプロジェクトを
使う方針（Discussion #19）なので採れません。

# 完了の確認

作った 2 人でトークンを取得できることを確かめます。

```bash
curl -s -X POST "https://kdhyeuasgxdlkzwqfbij.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" | jq -r '.access_token // .msg'
```

`invalid_credentials` が返る場合、ユーザーが未作成か、未確認か、パスワードが違います。

**次は [verify-hook.md](/project/plan/auth/manual/verify-hook.md) です。**
