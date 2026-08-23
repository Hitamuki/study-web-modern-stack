---
type: Runbook
title: 環境変数を用意する
description: .env と apps/api/.env を作る。未設定だと Hasura が起動せず、Actions は全リクエストを 401 で拒否する。
tags: [auth, 環境変数, 人間の作業, 手順書]
status: stable
stale_after: 2026-09-23
generated: { by: claude-code/claude-fable-5, at: 2026-08-23T00:00:00Z }
---

# 作るもの

| ファイル | 用途 |
| :- | :- |
| `.env`（リポジトリ直下） | `docker-compose.yml` の `${VAR}` 展開と、Vite のビルド時の埋め込み |
| `apps/api/.env` | NestJS が読む（`@prisma/client` が `process.env` に載せる） |

どちらも `.gitignore` 済みで**コミットされません**。

# 手順

```bash
cp .env.example .env          # まだ無い場合
openssl rand -hex 32          # HASURA_ACTION_SECRET 用の値を生成
```

`.env` に設定する値。

```bash
SUPABASE_PROJECT_REF="kdhyeuasgxdlkzwqfbij"
SUPABASE_PUBLISHABLE_KEY="<publishable key>"
HASURA_GRAPHQL_ADMIN_SECRET="myadminsecretkey"
HASURA_ACTION_SECRET="<上で生成した値>"

VITE_GRAPHQL_URL="http://localhost:8080/v1/graphql"
VITE_SUPABASE_URL="https://kdhyeuasgxdlkzwqfbij.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<publishable key>"
```

`apps/api/.env` に追記する値。**`HASURA_ACTION_SECRET` は上と同じ値**にします。

```bash
DATABASE_URL="postgres://user:password@localhost:5433/memo"
HASURA_ACTION_SECRET="<上と同じ値>"
```

> [!IMPORTANT]
> **service_role キーはどこにも書かないでください。** 全権を持ちます。
> `VITE_` 接頭辞の変数はビルド成果物に含まれ、**ブラウザから読めます**。publishable key は公開前提なので問題ありません。

# 未設定だとどうなるか

| 変数 | 未設定時の挙動 |
| :- | :- |
| `SUPABASE_PROJECT_REF` | **Hasura が起動しない**（JWKS の取得が critical で失敗）。`make backend-up` が事前チェックで止めて理由を出す |
| `HASURA_ACTION_SECRET` | Actions のハンドラが**全リクエストを 401 で拒否**する。設定漏れで素通りさせないため意図的にそうしている |
| `VITE_SUPABASE_*` | ログイン画面が Supabase に繋がらない |

# 確認

```bash
make backend-up   # エラーが出ずに ready まで進めば OK
```

**次は [reseed.md](/project/plan/auth/manual/reseed.md) です。**
