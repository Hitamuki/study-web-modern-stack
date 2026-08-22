---
type: Task
title: 層 1 — Hasura の JWT 認証と行レベル権限
description: 鍵穴を作る層。JWT モードに切り替え、user ロールの行レベル権限を定義する。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/22
tags: [auth, hasura, 層1]
status: stable
stale_after: 2026-09-18
generated: { by: claude-code/claude-fable-5, at: 2026-08-17T23:32:00Z }
---

# 位置づけ

**鍵穴を作る層。** これが無いと、上の層が JWT を持っても開ける先が無い。

ブランチ: `feat/22-hasura-jwt`（`main` から）
前提: [supabase-setup.md](/project/plan/auth/supabase-setup.md) が完了し `project-ref` が確定していること

# やること

完了条件は Issue [#22](https://github.com/Hitamuki/study-web-modern-stack/issues/22) の AC が正本。実装の要点だけ記す。

| 対象 | 内容 |
| :- | :- |
| `docker-compose.yml` | `HASURA_GRAPHQL_JWT_SECRET` を環境変数経由で渡す（`jwk_url` は Supabase の JWKS）。**`HASURA_GRAPHQL_UNAUTHORIZED_ROLE` は設定しない**（トークン無しを拒否するため） |
| `public_dummy.yaml` | `user` ロールの select / insert / update / delete。filter は `owner_id: { _eq: X-Hasura-User-Id }` |
| 同上（insert） | `set: { owner_id: X-Hasura-User-Id }` で**セッション変数から強制**。クライアントに指定させない |
| `actions.yaml` | 3 つの Action に `permissions: [{ role: user }]` を追加。**これが無いと `user` ロールから Action を呼べない** |
| `api_limits.yaml` | 深さ・レート制限（現在 `{}`） |
| `.env.example` | 追記。置き場所は要判断（ルートは MCP 専用） |

# 効くこと

この層が入ると [findings.md](/project/plan/auth/findings.md) の 1
（`createDummy` が 400 になる問題）が解消する。Hasura がセッション変数を付けるようになるため。

# 注意

**この層だけ `main` に入っても壊れない。** admin secret を残す限り admin アクセスは生き続けるので、
Web は今までどおり動く。壊れるのは層 5。
