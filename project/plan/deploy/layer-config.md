---
type: Task
title: 層 4 — ベタ書き設定の外部化
description: localhost / host.docker.internal / 平文の admin secret を環境変数から読む形にする。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/89
tags: [deploy, hasura, apps-web, 設定, 層4]
status: draft
stale_after: 2026-09-24
generated: { by: claude-code/claude-fable-5, at: 2026-08-24T00:00:00Z }
---

# 位置づけ

**「どこに載せるか」は決まっていなくても、「環境変数から読む」形にはできる。**
値そのものは段階 2 で入れる。この層は**受け口を作るだけ**。

Issue: **未起票**（`refactor`）
ブランチ: `refactor/NN-externalize-config`（層 3 の上）
前提: なし。**Discussion #29 の決着を待たない**

# やること

[findings.md](/project/plan/deploy/findings.md) の 4 の表がそのまま対象である。

| ファイル | 現状 | 変更 |
| :- | :- | :- |
| `hasura/config.yaml:2` | `endpoint: http://localhost:8080` | 環境変数から。Hasura CLI は `HASURA_GRAPHQL_ENDPOINT` を読む |
| `hasura/config.yaml:3` | `admin_secret: myadminsecretkey` | **行を消す。** CLI は `HASURA_GRAPHQL_ADMIN_SECRET` を読む |
| `packages/graphql/codegen.ts:7` | `?? "myadminsecretkey"` | フォールバックを外すか、ローカル専用と明記する |
| `docker-compose.yml:29` | `HASURA_GRAPHQL_CORS_DOMAIN: "*"` | 環境変数化。ローカルの既定は現状維持でよい |
| `hasura/metadata/actions.yaml` | `handler: http://host.docker.internal:3001/...`（**3 箇所**） | `{{ACTION_BASE_URL}}/hasura/actions/...` に変える |
| `apps/web/src/shared/config/env.ts:8` | `?? "http://localhost:8080/v1/graphql"` | フォールバックの是非を判断する |

## `actions.yaml` が要点

3 つの Action が **`host.docker.internal:3001` を直接持っている。**
`config.yaml` の `handler_webhook_base_url` は CLI 用で、**メタデータには効いていない。**

Hasura は `{{VAR}}` 形式でメタデータ内の環境変数を展開できるため、
`{{ACTION_BASE_URL}}/hasura/actions/createDummy` の形にして
`ACTION_BASE_URL` をローカルと本番で切り替える。

**`host.docker.internal` は Docker Desktop 固有の名前**で、クラウドでは解決できない。
ここを直さないと、載せ先が決まっても Actions が動かない。

## `admin_secret` は消すだけでは足りない

`hasura/config.yaml` の平文シークレットは**既にコミット履歴に入っている。**
行を消しても履歴からは消えない。

したがって **本番の admin secret は必ずこれと別の値にする。**
リポジトリを public にする場合（Discussion
[#41](https://github.com/Hitamuki/study-web-modern-stack/discussions/41)）も、
この値がローカル専用であることが前提になる。

# あわせて整える

`.env.example` に段階 2 で要る変数の**枠だけ**を足すか判断する。
値が決まるのは #29 の決着後だが、**何が要るかは今わかる。**

```bash
HASURA_GRAPHQL_ENDPOINT=   # Hasura CLI の向き先
ACTION_BASE_URL=           # Actions のハンドラ（NestJS）のベース URL
HASURA_GRAPHQL_CORS_DOMAIN=
```

**変数を置くだけで誰も読まない状態を作らない。** `.env.example` には
「Resend の API キーはここに置かない」という前例があり、
**置き場所の理由を書く方針**が既にある（`.env.example` 末尾）。同じ書き方に揃える。

# 確認すること

- `make backend-init` / `make backend-start` がローカルで従来どおり動く
- `make codegen` が通る
- Web から一覧・作成・更新・削除ができる
