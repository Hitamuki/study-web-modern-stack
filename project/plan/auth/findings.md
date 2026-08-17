---
type: Finding
title: 着手前に知っておくべき事実
description: 認証・認可の実装に入る前に判明した、Issue 本文には書かれていない 5 つの事実。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/20
tags: [auth, hasura, apps-web, apps-api, 既知の不具合]
status: stable
stale_after: 2026-09-18
generated: { by: claude-code/claude-fable-5, at: 2026-08-17T23:32:00Z }
---

# 1. `main` は現在 `createDummy` が動かない

Issue [#21](https://github.com/Hitamuki/study-web-modern-stack/issues/21) の副作用。
`apps/api/src/infrastructure/controllers/hasura-action.controller.ts` の `requireSessionUserId()` が
`session_variables['x-hasura-user-id']` を必須で読むが、**admin secret 接続では Hasura がこの変数を付けない**。
そのため Web からのメモ新規作成は必ず 400 になる。

**層 1（JWT モード）で解消する。** それまでは壊れたままである点を承知して進める。
`updateDummy` / `deleteDummy` はセッション変数を読まないため動く。

# 2. `updateDummy` / `deleteDummy` に所有者チェックが無い

Actions は Hasura のパーミッションを迂回して NestJS → Prisma に直行する。
`UpdateDummyUseCase` / `DeleteDummyUseCase` は id だけで実行するため、**他人のレコードを更新・削除できる**。
#21 で追加した `Dummy.isOwnedBy()` は**どこからも呼ばれていない死んだコード**になっている。

→ [layer-actions-guard.md](/project/plan/auth/layer-actions-guard.md) のスコープに含める。

# 3. `dummy.controller.ts` は認証なしのまま残る

`apps/api/src/infrastructure/controllers/dummy.controller.ts`（Hasura を経由しない REST）は
所有者をリクエストボディから受け取るため、**任意のユーザーになりすませる**。
元から認証が無いエンドポイントだが、`owner_id` の導入で危険性が上がった。

**この計画のスコープ外。公開前に別 Issue で塞ぐ必要がある**（Issue 未起票）。

# 4. Hasura 側がほぼ空

| ファイル | 現状 |
| :- | :- |
| `hasura/metadata/databases/default/tables/public_dummy.yaml` | `table:` の 3 行のみ。**permissions が一切無い** |
| `hasura/metadata/actions.yaml` | **`permissions:` 未定義**。JWT モードにすると `user` ロールから Action を呼べなくなる |
| `hasura/metadata/api_limits.yaml` | `{}` |
| `docker-compose.yml` | 全値が平文ベタ書き。`env_file` 指定なし |

Hasura は **v2.20.0**。

# 5. `apps/web` に足りないもの

- **ルーターが無い**（`App.tsx` は 9 行で `<ApolloProvider><DummyPage /></ApolloProvider>` のみ）
- `shared/ui/` は `Button.tsx` と `dialog.tsx` の 2 つだけ。`input` / `label` / `card` は無い
- フォームライブラリもスキーマバリデータも無い。既存パターンは
  **controlled + props リフトアップ + ページ側で 1 行バリデーション**
- `@supabase/supabase-js` 未導入
- **`--pen-danger-bg` / `--pen-gap-lg` が `styles.css` に無い。** ESLint の `better-tailwindcss` が
  `recommended-error` で効いており、**`@theme` に無いクラスを書くとエラーになる**

## その他

- `packages/graphql/codegen.ts` にも **admin secret がハードコード**されている
- 生成型 `packages/graphql/src/generated/graphql.ts` に `owner_id` が無い → codegen 再実行が必要
- Apollo Client は **v4 系**。auth link の書き方が v3 と異なる
- `ApolloProvider` は 3 箇所から **props 無し**で呼ばれている（mobile は `apps/mobile/App.tsx`。`src/` の外）
- ルートの `.env.example` は **MCP 専用**。Hasura / Supabase 用の変数の置き場所は未決
