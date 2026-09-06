# ER 図の補足

[er-diagram.md](./er-diagram.md) は生成物のため、解説はこのファイルに置く。

## ファイルの役割

| ファイル | 性質 | 編集 |
| :- | :- | :- |
| [er-diagram.md](./er-diagram.md) | ER 図（mermaid） | **不可。生成で上書きされる** |
| er-diagram-notes.md（本ファイル） | 解説 | 手で書く |
| `apps/api/prisma/schema.prisma` | **DB 定義の正本** | 手で書く |

## 生成

- 生成器は [prisma-erd-generator](https://github.com/keonik/prisma-erd-generator)
- `prisma generate` で `schema.prisma` から出力
- `apps/api` の `postinstall` に乗るため、`pnpm install` のたびに再生成される
- 図に出る型は **Prisma の型**（`String` / `DateTime`）。SQL の型は `schema.prisma` の `@db.*` を見る
- テーブルを変えるときは `schema.prisma` を直す。図は触らない

## dummy

- SCR-005 ダミー画面の検証用。実ドメインが固まるまでの仮置き
- 日時は `timestamptz`。`timestamp` はオフセットが付かず、クライアントがローカル時刻と誤読する
- `owner_id` は Supabase Auth のユーザー ID（`auth.users.id` = JWT の `sub`）。型は `uuid`
- `owner_id` に索引。Hasura の行レベル権限が全クエリで条件に入れるため
- **`owner_id` は `users.id` への外部キー**（#101）。`onDelete: Cascade`

## users

**DB を Supabase に一本化したことで導入した**（#101）。それまで `users` が無く外部キーも
張れなかったのは、`auth.users` とドメインテーブルが別インスタンスにあったためで、
同居した時点でその理由が消えた。

- `users.id` は JWT の `sub` と同値。`auth.users` と 1:1
- **`auth` スキーマは Supabase の管理下。アプリのテーブルから直接参照しない**（`public.users` を挟む）
- `users.role` は利用者ごとに権限を分けるための列。Hasura のロール名に対応させる
- ドメイン層の `OwnerId` による形式検証は**残している**。DB の制約とアプリの不変条件は別物

### auth.users との同期

**Prisma は `auth` スキーマを管理しない**ため、`public.users` の行を作るのは
[supabase/sql/sync_auth_users.sql](../supabase/sql/sync_auth_users.sql) のトリガーの責務。
`auth.users` への挿入と同じトランザクションで作る（サインアップ直後に行が無いと外部キーで弾かれるため）。

**`public.users` から `auth.users` への外部キーは張っていない。** シードの「他人役」のように、
ログインできないが所有者としては存在するユーザーを置けるようにするため。

### role の現状

**値は実質すべて `user`。** Hasura に定義しているロールが `user` の 1 つだけのため（#101 の判断）。
Hook（[custom_access_token_hook.sql](../supabase/sql/custom_access_token_hook.sql)）は
`users.role` を読む形になっているので、**ロールを増やせば列の値がそのまま JWT に載る。**

## 関連

- [context-map.md](./context-map.md) — システム全体の構成
- [domain-model.md](./domain-model.md) — `OwnerId` 値オブジェクト
