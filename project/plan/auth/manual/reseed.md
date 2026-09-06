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
> [!NOTE]
> **この差し替えは #101 で不要になりました。**
> `make db-seed` が `.env` の `SUPABASE_USER_UID_1` をそのまま所有者に使うようになったためです。
> 以下は当時の記録です。

**いまの手順は `make db-seed` だけです。**

```bash
make backend-up
make db-seed
```

`.env` の `SUPABASE_USER_UID_1`（実在する検証用ユーザー）に 3 件、
他人役の `00000000-0000-4000-8000-000000000002` に 1 件が付きます。

他人役は `auth.users` に存在しないためログインできませんが、
「他人のレコードが見えないこと」を確かめる相手としては十分です。
`public.users` から `auth.users` への外部キーは張っていないので、この行を置けます。

## 以前の手順（#101 より前）

ユーザーの実体は Supabase 側の `auth.users`、メモはローカルの Docker PostgreSQL にあり、
外部キーも JOIN もありませんでした（Issue #21 の判断）。そのため手で揃える必要がありました。

```bash
make db-seed    # 固定 UUID の状態に戻す

docker compose exec -T postgres psql -U user -d memo <<'SQL'
UPDATE dummy SET owner_id = '<ユーザー A の UUID>'
 WHERE owner_id = '00000000-0000-4000-8000-000000000001';
SQL
```

**次は [../verification.md](/project/plan/auth/verification.md) の通し検証です。**
