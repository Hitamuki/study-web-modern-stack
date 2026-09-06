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

## users（未導入）

アプリの DB を Supabase へ移した時点で導入する。`schema.prisma` に追加すれば図へ自動で反映される。

- `public.users` を置き、`auth.users.id` を参照する
- `auth` スキーマは Supabase の管理下。アプリのテーブルから直接参照しない
- `users.id` は JWT の `sub` と同値。`auth.users` と 1:1
- `users.role` で利用者ごとに権限を分ける。Hasura のロールに対応させる
- `dummy.owner_id` は `users.id` への外部キーにする
- 現在 `users` が無く外部キーも無いのは、`auth.users` とドメインテーブルが別インスタンスにあるため
- ドメイン層の `OwnerId` による形式検証は外部キー導入後も残す。DB の制約とアプリの不変条件は別物

## 関連

- [context-map.md](./context-map.md) — システム全体の構成
- [domain-model.md](./domain-model.md) — `OwnerId` 値オブジェクト
