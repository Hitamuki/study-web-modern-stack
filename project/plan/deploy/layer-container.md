---
type: Task
title: 層 2 — apps/api のコンテナ化
description: pnpm workspace + Catalogs + Prisma を含む NestJS を、どこにでも載る OCI イメージにする。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/87
tags: [deploy, apps-api, docker, 層2]
status: draft
stale_after: 2026-09-24
generated: { by: claude-code/claude-fable-5, at: 2026-08-24T00:00:00Z }
---

# 位置づけ

**載せ先が決まる前に用意できる、最も重い作業。**
主要な PaaS はどれも OCI イメージを受け取るため、ここは #29 の結論に依存しない。

Issue: **未起票**（`build` / `apps/api`）
ブランチ: `build/NN-api-dockerfile`（層 1 の上）
前提: なし。**Discussion #29 の決着を待たない**

# なぜ難しいか

[findings.md](/project/plan/deploy/findings.md) の 2 のとおり、
**このリポジトリに Dockerfile は 1 つも無い。** `apps/api` は一度もコンテナになっていない。

素直に「`apps/api` を `COPY` して `pnpm install`」と書くと失敗する。

| 論点 | 内容 |
| :- | :- |
| workspace | `apps/api` 単体では解決できない。ルートの `pnpm-lock.yaml` / `pnpm-workspace.yaml` が要る |
| Catalogs | `catalog:backend` はロックファイル経由でしか解決できない |
| Prisma の生成 | `postinstall` の `prisma generate` が走る。**生成物をランタイム段へ持ち越す** |
| Prisma のエンジン | OS / libc 依存。**Alpine（musl）と Debian（glibc）で別バイナリ** |
| イメージサイズ | ビルド段の `devDependencies` を最終段に持ち込まない（multi-stage） |

`pnpm deploy --legacy` や `pnpm fetch` を使う定石があるため、
**実装前に pnpm の公式ドキュメントを確認する。**

# やること

| 対象 | 内容 |
| :- | :- |
| `apps/api/Dockerfile` | multi-stage。ビルド段でロックファイルごと解決 → ランタイム段は本番依存 + `dist` + Prisma 生成物 |
| `.dockerignore` | ルートに置く。`node_modules` / `dist` / `.env` / `.git` を除外 |
| `docker-compose.yml` | **`api` サービスを足すか判断する。** 足すとローカルでも同じイメージを検証できる |

`main.ts:9` は既に `process.env.PORT ?? 3001` を読むため、**PaaS の `PORT` 注入にそのまま追随する。**
ここは直さない。

# 確認すること

- `docker build` が通り、`docker run -e PORT=3001 -e DATABASE_URL=... -e HASURA_ACTION_SECRET=...` で起動する
- コンテナ内から Prisma がクエリを実行できる（エンジンのバイナリが一致している）
- イメージサイズが妥当（数百 MB 程度に収まっているか）

# 決めきらないこと

**レジストリ（イメージの置き場所）は #29 の決着後に決める。**
GitHub Container Registry / 各プラットフォームの内蔵レジストリ / Artifact Registry のどれになるかは
載せ先に依存する。この層では**ローカルでビルドが通るところまで**を範囲にする。
