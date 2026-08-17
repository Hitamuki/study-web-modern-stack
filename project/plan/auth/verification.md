---
type: Runbook
title: 全層マージ後の検証手順
description: 5 層が入った後に、認証と認可が実際に効いていることを確認する手順。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/20
tags: [auth, 検証, runbook]
status: stable
stale_after: 2026-09-18
generated: { by: claude-code/claude-fable-5, at: 2026-08-17T23:32:00Z }
---

# 前提

`gh stack merge --merge` → `gh stack sync --prune` が済んでいること。
Supabase に**検証用ユーザーを 2 人**作り、それぞれの JWT を用意する。

シードは `apps/api/prisma/seed.sql` が 2 ユーザー分に分けてある
（A: `...0001` が 3 件 / B: `...0002` が 1 件）。**この UUID を実ユーザーの ID に差し替えて使う。**

```bash
make backend-init   # スキーマ反映 → メタデータ適用 → シード投入
```

# 1. 自分のレコードだけ見える

```bash
curl -s http://localhost:8080/v1/graphql \
  -H "Authorization: Bearer $TOKEN_A" \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ dummy { id content } }"}'
```

ユーザー A のレコードのみが返ること。

# 2. 他人のレコードが見えない

`$TOKEN_B` で同じクエリを投げ、**A のレコードが 1 件も含まれない**こと。

# 3. 認証なしが拒否される

```bash
curl -s http://localhost:8080/v1/graphql \
  -H 'Content-Type: application/json' -d '{"query":"{ dummy { id } }"}'
```

エラーになること（`HASURA_GRAPHQL_UNAUTHORIZED_ROLE` を設定していないため）。

# 4. Actions が Hasura 以外から叩けない

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3001/hasura/actions/createDummy \
  -H 'Content-Type: application/json' -d '{"input":{"content":"x"}}'
```

**401** であること。

# 5. 他人のレコードを更新・削除できない

B のトークンで A のレコード id を指定して `updateDummy` / `deleteDummy` を実行し、拒否されること。
[layer-actions-guard.md](/project/plan/auth/layer-actions-guard.md) の 3-2 で入れる所有者チェックの確認。

# 6. admin secret が消えている

```bash
grep -rn "x-hasura-admin-secret\|myadminsecretkey" apps/web packages/graphql
```

`apps/web` と `packages/graphql` にヒットが無いこと。
`docker-compose.yml` と `hasura/config.yaml` には残る（サーバー側の運用値）。

# 7. 画面から通しで確認

```bash
make backend-start   # 別ターミナル
make web-start
```

アカウント作成 → 確認メール → ログイン → 自分のメモだけ表示 → ログアウト → 再度ログインを求められる。
パスワードリセットは申請 → メールのリンク → 新しいパスワード設定 → 新パスワードでログイン。

# 8. 静的チェック

```bash
make check
```

> [!NOTE]
> `make test` は「実行対象のタスクが無い」状態で終了する。
> **リポジトリにテストが 1 本も無い**既存の状態で、この計画の対象外。
