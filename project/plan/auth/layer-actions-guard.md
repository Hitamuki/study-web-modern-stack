---
type: Task
title: 層 3 — Hasura Actions ハンドラの保護
description: 裏口を塞ぐ層。共有シークレットの検証と、update/delete の所有者チェック。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/26
tags: [auth, apps-api, 層3, セキュリティ]
status: stable
stale_after: 2026-09-18
generated: { by: claude-code/claude-fable-5, at: 2026-08-17T23:32:00Z }
---

# 位置づけ

**裏口を塞ぐ層。** Hasura のパーミッションをどれだけ固めても、
`POST /hasura/actions/createDummy` を直接叩けばドメインロジックを通って素通りしてしまう。

ブランチ: `feat/26-action-guard`（層 2 の上に `gh stack add`）

# やること

完了条件は Issue [#26](https://github.com/Hitamuki/study-web-modern-stack/issues/26) の AC が正本。

## 3-1. 呼び出し元が Hasura であることの検証

- Action 定義（`hasura/metadata/actions.yaml`）に共有シークレットのヘッダを追加し、値は環境変数から
- ハンドラで検証し、不一致は **401**。NestJS の Guard として実装し、
  `domain-validation.filter.ts` とは別経路にする
- `.env.example` に追記

## 3-2. `update` / `delete` の所有者チェック（Issue 本文に無い追加分）

[findings.md](/project/plan/auth/findings.md) の 2 で判明した穴を塞ぐ。

`UpdateDummyUseCase` / `DeleteDummyUseCase` は id だけで実行するため、**他人のレコードを更新・削除できる**。
Actions は Hasura のパーミッションを迂回するので、Hasura 側の行レベル権限では防げない。

Issue #21 で追加した `Dummy.isOwnedBy()` が**どこからも呼ばれていない死んだコード**になっているので、
ここで使う。ハンドラがセッション変数から取った所有者と突き合わせ、不一致なら拒否する。

# すでに済んでいること

「所有者を `input` ではなく `session_variables` から取る」部分は
Issue [#21](https://github.com/Hitamuki/study-web-modern-stack/issues/21) で実装・検証済み。
`requireSessionUserId()` がそれ。本層で作るのは**その手前の関門**にあたる。
