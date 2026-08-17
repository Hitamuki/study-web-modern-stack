---
type: Plan
title: 認証・認可の導入
description: apps/web から admin secret を消し、ログインしたユーザーが自分のレコードだけを読み書きできる状態にする。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/20
tags: [auth, supabase, hasura, jwt]
status: stable
stale_after: 2026-09-18
generated: { by: claude-code/claude-fable-5, at: 2026-08-17T23:32:00Z }
sources:
  - resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/19
    title: 認証サービスの選定（Supabase Auth に決着）
  - resource: https://github.com/Hitamuki/study-web-modern-stack/wiki/Authentication-Authorization
    title: Wiki 認証・認可
---

# 目的

フロントエンドが Hasura の admin secret をクライアントに埋め込んで接続している。
これは手抜きではなく必然で、`dummy` テーブルにパーミッションが 1 つも定義されていないため
**admin 以外は何も読めない**のが原因である。

したがって順序が決まっている。**下の層が「鍵穴」を作らないと、上の層が「鍵」を持っても意味がない。**

# 完了条件

Issue [#20](https://github.com/Hitamuki/study-web-modern-stack/issues/20) の AC が正本。要点は 3 つ。

1. `apps/web` と `packages/graphql` から `x-hasura-admin-secret` が消えている
2. 別ユーザーの JWT で他人のレコードが取得できない
3. 認証なしのリクエストが拒否される

# 層の積み順

AGENTS.md の積み順（`hasura` → `packages/graphql` → `apps/api` → `apps/web`）に従う。
**Issue は層ごとに分けたまま**、`gh stack` で 1 本に積み、`gh stack merge --merge` で all-or-nothing にマージする。

```text
main
 └ feat/22-hasura-jwt       hasura            → #22
  └ feat/23-apollo-jwt      packages/graphql  → #23
   └ feat/26-action-guard   apps/api          → #26
    └ feat/NN-web-router    apps/web          → ルーター導入（Issue 未起票）
     └ feat/24-web-auth     apps/web          → #24
```

## なぜ 1 Issue にまとめないか

**`main` が壊れる瞬間を作らないため**であり、Issue の数を減らすこと自体は目的にならない。

- 層 1 単独で `main` に入っても壊れない。admin secret を残す限り admin アクセスは生き続ける
- **壊れるのは層 5（admin secret の削除）**。層 2 が無いと Web は何も取得できなくなる
- したがって層 2 と層 5 は必ず同時に `main` へ入る必要があり、それを保証するのがスタックの all-or-nothing マージ

1 PR に統合すると 4 領域が 1 つの差分になり、「レビュアーが 15 分で読み切れる」サイズを超える。

# 対象外

- `apps/mobile` / `apps/desktop` への認証導入（Issue #25。開発停止中）。
  層 2 で共通クライアントを変えるため、**両アプリはビルドは通るが未認証**の状態になる
- TLS の有効化（Issue #27）
- `dummy.controller.ts`（Hasura を経由しない REST）の保護 → [findings.md](/project/plan/auth/findings.md) を参照
