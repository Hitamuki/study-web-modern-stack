---
type: Runbook
title: シードの所有者を実ユーザーに差し替える
description: seed.sql の固定 UUID は実ユーザーと一致しない。差し替えないと 0 件しか返らず権限が壊れて見える。
tags: [auth, seed, 人間の作業, 手順書]
status: stable
stale_after: 2026-09-23
generated: { by: claude-code/claude-fable-5, at: 2026-08-23T00:00:00Z }
---

# なぜ必要か

`apps/api/prisma/seed.sql` の `owner_id` は**検証用の固定 UUID**です。

```
ユーザー A: 00000000-0000-4000-8000-000000000001（3 件）
ユーザー B: 00000000-0000-4000-8000-000000000002（1 件）
```

Supabase で作った実ユーザーの UUID とは一致しません。差し替えないと Hasura の行レベル権限が
**全件を弾いて 0 件を返します**。「権限が壊れている」ように見えますが、正しく動いています。

> [!NOTE]
> **2 つの DB は「JWT の中の UUID」だけで繋がっています。**
> ユーザーの実体は Supabase 側の `auth.users`、メモはローカルの Docker PostgreSQL にあり、
> 外部キーも JOIN もありません（Issue #21 の判断）。だから手で揃える必要があります。

# 手順

手順 1 で控えた 2 人の UUID を使います。

```bash
make backend-up
make db-seed    # 固定 UUID の状態に戻す

docker compose exec -T postgres psql -U user -d memo <<'SQL'
UPDATE dummy SET owner_id = '<ユーザー A の UUID>'
 WHERE owner_id = '00000000-0000-4000-8000-000000000001';
UPDATE dummy SET owner_id = '<ユーザー B の UUID>'
 WHERE owner_id = '00000000-0000-4000-8000-000000000002';
SELECT owner_id, count(*) FROM dummy GROUP BY owner_id ORDER BY owner_id;
SQL
```

A に 3 件、B に 1 件が付いていれば完了です。

> [!TIP]
> `make db-seed` を流すたびに固定 UUID へ戻ります。差し替えも合わせて実行するようにしてください。

**次は [../verification.md](/project/plan/auth/verification.md) の通し検証です。**
