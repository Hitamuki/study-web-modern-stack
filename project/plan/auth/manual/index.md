# 人間の対応が必要な手順

実装（PR #77〜#81）は積み終わっています。**ここに書かれた作業が終わるまで検証できません。**

代行できない理由は 2 つです。Supabase のダッシュボード操作にサインインが要ること、
そして本番相当の秘匿値（service_role キーなど）を扱うことです。

## 順序

上から順に実施してください。前の手順の出力を次で使います。

| # | 手順 | 所要 | 出力 |
| :- | :- | :- | :- |
| 1 | [supabase-users.md](/project/plan/auth/manual/supabase-users.md) | 5 分 | 検証用ユーザー 2 人の **UUID**（**完了済み**） |
| 2 | [verify-hook.md](/project/plan/auth/manual/verify-hook.md) | 2 分 | Hook が効いているかの判定 |
| 3 | [env-setup.md](/project/plan/auth/manual/env-setup.md) | 5 分 | `.env` / `apps/api/.env` |
| 4 | [reseed.md](/project/plan/auth/manual/reseed.md) | 2 分 | 実ユーザーに紐づいたシードデータ |
| 5 | [../verification.md](/project/plan/auth/verification.md) | 10 分 | 通しの検証（**完了済み**） |
| 6 | [resend-smtp.md](/project/plan/auth/manual/resend-smtp.md) | 30 分 | 第三者にメールが届く状態。**Discussion #46 待ちでブロック中** |

> [!IMPORTANT]
> **手順 2 でつまずいたら先に進まないでください。**
> Custom Access Token Hook が効いていないと JWT に `x-hasura-user-id` が入らず、
> Hasura の行レベル権限が全件を弾きます。**「権限が壊れている」ように見えますが、実際には正しく動いています。**

## `.env` に控える値

作成した検証用ユーザーは `.env`（`.gitignore` 済み）に控えます。以降の手順はここから読み込みます。

```bash
SUPABASE_USER_EMAIL_1= / SUPABASE_USER_PASSWORD_1= / SUPABASE_USER_UID_1=
SUPABASE_USER_EMAIL_2= / SUPABASE_USER_PASSWORD_2= / SUPABASE_USER_UID_2=
```

## 前提

- Supabase プロジェクトは作成済み（`project-ref` = `kdhyeuasgxdlkzwqfbij`）
- Custom Access Token Hook は登録済み（手順 2 で実際に効いているか確かめる）
- ツールは `mise install` で揃う（`supabase` CLI を追加済み）

## この手順が終わったらできること

- `gh stack merge --merge` で PR #77〜#81 を 5 本まとめてマージ
- Issue #22 / #23 / #24 / #26 / #76 の AC を実測で埋める
