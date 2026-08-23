# 無料枠への常設デプロイ

Discussion [#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) の実装計画です。

**目的**: ローカルの Docker Compose でしか動いていないアプリを、無料枠のサービスに常設し、
`infra/` の Terraform でその構成を管理する。

## いまの状況

**Discussion #29 は未決着**ですが、段階 1（前提条件）の Issue は起票済みです
（[#86](https://github.com/Hitamuki/study-web-modern-stack/issues/86) / [#87](https://github.com/Hitamuki/study-web-modern-stack/issues/87) / [#88](https://github.com/Hitamuki/study-web-modern-stack/issues/88) / [#89](https://github.com/Hitamuki/study-web-modern-stack/issues/89)。いずれも Board の `Backlog`）。

ただし **決着を待たずに進められる作業が 4 層あります。** このリポジトリは載せ先が決まっても
今のままでは安全に載らないためです（[findings.md](/project/plan/deploy/findings.md) の 1〜4）。

> [!WARNING]
> **`/dummies` が認証なしで全ユーザーのデータを読み書きできる状態です**
> （[findings.md](/project/plan/deploy/findings.md) の 1）。
> Hasura の行レベル権限（Issue #22）は**この経路には効きません。**
> 公開の可否と関係なく、[層 1](/project/plan/deploy/layer-close-rest.md) を最初に塞いでください。

## 読む順序

| # | ファイル | 内容 |
| :- | :- | :- |
| 1 | [objective.md](/project/plan/deploy/objective.md) | 何を達成すれば完了なのか。**2 つの段階に分かれる理由** |
| 2 | [findings.md](/project/plan/deploy/findings.md) | **着手前に知っておくべき 8 つの事実**（認証なしの REST を含む） |
| 3 | [decision.md](/project/plan/deploy/decision.md) | **#29 で決めること。** 何が拘束済みで何が未決か |
| 4 | [terraform-scope.md](/project/plan/deploy/terraform-scope.md) | **Terraform で何を管理するか。** プロバイダの実態と `infra/` の処遇 |
| 5 | [layer-close-rest.md](/project/plan/deploy/layer-close-rest.md) | 層 1 — 認証なしの REST を塞ぐ |
| 6 | [layer-container.md](/project/plan/deploy/layer-container.md) | 層 2 — `apps/api` のコンテナ化 |
| 7 | [layer-ci.md](/project/plan/deploy/layer-ci.md) | 層 3 — CI の土台 |
| 8 | [layer-config.md](/project/plan/deploy/layer-config.md) | 層 4 — ベタ書き設定の外部化 |
| 9 | [phase-2.md](/project/plan/deploy/phase-2.md) | **段階 2 の輪郭。** #29 の決着が前提 |
| 10 | [explain/](/project/plan/deploy/explain/index.md) | **初学者向けの解説。** 目的・デプロイとは・構成・IaC・無料枠 |

## 2 つの段階

```text
段階 1: 公開の前提条件（層 1〜4）  ← #29 の決着を待たずに進められる
段階 2: 実際に載せる（層 5〜10）   ← #29 の決着が必要
```

## 次にやること

1. **[層 1](/project/plan/deploy/layer-close-rest.md)（#86）に着手する。** #29 と独立しており、**最も緊急**。
   認証なしで他人のデータに触れる経路が開いたままのため、公開の可否と関係なく塞ぐ
2. **[decision.md](/project/plan/deploy/decision.md) の「#29 に足りていない評価軸」を #29 にコメントで追記する。**
   Terraform で管理できるかが評価軸に無く、**この軸で候補が実際に絞られる**
3. 層 2〜4（#87 / #88 / #89）を `Todo` に移して実施期間を設定する（DoR に #29 を**含めない**）

Issue は 4 件とも起票済みで、Board では `Backlog` です。着手を決めた時点で `Todo` に移し、
実施期間（`開始日` / `終了日`）を設定してください（AGENTS.md「Status と実施期間」）。
