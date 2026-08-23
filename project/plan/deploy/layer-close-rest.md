---
type: Task
title: 層 1 — 認証なしの REST を塞ぐ
description: 公開前に必ず消す穴。/dummies は認証がなく、所有者をリクエストボディから受け取る。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/86
tags: [deploy, apps-api, セキュリティ, 層1]
status: draft
stale_after: 2026-09-24
generated: { by: claude-code/claude-fable-5, at: 2026-08-24T00:00:00Z }
---

# 状態

**完了しました（#86）。** `dummy.controller.ts` を削除し、`GET` / `POST` / `PATCH` / `DELETE` の
4 メソッドとも 404 になることを実測しています。あわせて、そこからしか到達できなかった
`ListDummiesUseCase` と `DummyRepository.findAll()`（所有者で絞らない全件取得）も削除しました。

# 位置づけ

**唯一「公開する / しない」に関わらず今すぐ塞ぐべき層。**
他のどの層よりも差分が小さく、他のどの層よりも影響が大きい。

Issue: **未起票**（`fix` / `apps/api`）
ブランチ: `fix/NN-close-dummy-rest`（`main` から）
前提: なし。**Discussion #29 の決着を待たない**

# 何が問題か

詳細は [findings.md](/project/plan/deploy/findings.md) の 1。要点だけ再掲する。

`apps/api/src/infrastructure/controllers/dummy.controller.ts` は
認証を持たず、`ownerId` を**リクエストボディから**受け取る。
`dummy.module.ts:26` で登録済み、**現在も有効**。

Hasura の行レベル権限（Issue #22）は **Hasura を通る経路にしか効かない。**
この REST は Prisma へ直行するため権限を丸ごと迂回する。

# やること

**「削除」を推奨する。** 理由は 3 つ。

| 理由 | 内容 |
| :- | :- |
| 代替がある | 読み取りは Hasura の自動生成クエリ、書き込みは Actions（`hasura-action.controller.ts`）が担う |
| 用途が消えている | コード自身のコメントが「**ローカル検証専用**」と書いている |
| 守る方法が無い | Guard を付けるなら Actions と同じ共有シークレットになるが、それは Actions の経路と同じもの。**二重に持つ意味が無い** |

削除する範囲:

| 対象 | 内容 |
| :- | :- |
| `dummy.controller.ts` | ファイルごと削除 |
| `dummy.module.ts` | `controllers` から `DummyController` を外す。import も消す |
| `list-dummies.use-case.ts` | **`DummyController` からしか呼ばれていない**（`hasura-action.controller.ts` は create / update / delete のみ）。あわせて削除するか判断する |
| `DUMMY_REPOSITORY` の `provideUseCase(ListDummiesUseCase)` | 上に合わせる |

> [!NOTE]
> `ListDummiesUseCase` を残す判断もありうる。**Hasura を経由しない一覧取得が将来要る**なら、
> 死んだコードとして残すより Issue にして消すほうが筋がよい。
> [auth/findings.md](/project/plan/auth/findings.md) の 2 で、
> `Dummy.isOwnedBy()` が「どこからも呼ばれていない死んだコード」になった前例がある。

# 確認すること

- `GET /dummies` が 404 になる
- Web からの一覧表示・作成・更新・削除が**従来どおり動く**（経路は Hasura のまま）
- `make check` が通る

# 注意

**この層だけ `main` に入っても壊れない。** Web は Hasura 経由なので影響を受けない。
