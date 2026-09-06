# 無料枠への常設デプロイ

Discussion [#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) の実装計画です。

**目的**: ローカルの Docker Compose でしか動いていないアプリを、無料枠のサービスに常設し、
その構成を Terraform で管理する。

## いまの状況

**Discussion #29 は 2026-09-06 に決着しました。** 全 11 層に着手できる状態です。

| レイヤー | 採用 |
| :- | :- |
| 静的フロント | **Cloudflare Workers + Static Assets** |
| DNS | **Cloudflare DNS**（`sk8trickhub.com`） |
| GraphQL エンジン | **Hasura Cloud（v2 / Cloud Free）** |
| DB・認証 | **Supabase** |
| API | **NestJS on Render Free**（Docker） |
| メール | **Resend** / 監視 | **UptimeRobot** |
| CI/CD | **GitHub Actions** / IaC | **Terraform** |

**認可は Hasura の行レベル権限、スキーマの正本は Prisma です**（構成案にあった Supabase RLS と
Supabase CLI マイグレーションは採りません。理由は
[terraform-scope.md](/project/plan/deploy/terraform-scope.md)）。

| 段階 | 内容 |
| :- | :- |
| **1** | **現状の構成を削除** |
| **2** | **デプロイ準備** |
| **3** | **実際に載せる** |

> [!NOTE]
> **層 1（#86）は完了しました。** 認証なしの `/dummies` を削除し、4 メソッドとも 404 になることを
> 実測済みです。書き込みの正規経路は Hasura Actions のみで、共有シークレットで保護されています。

## 読む順序

| # | ファイル | 内容 |
| :- | :- | :- |
| 1 | [objective.md](/project/plan/deploy/objective.md) | 何を達成すれば完了なのか。**3 つの段階に分かれる理由** |
| 2 | [findings.md](/project/plan/deploy/findings.md) | **着手前に知っておくべき 8 つの事実** |
| 3 | [decision.md](/project/plan/deploy/decision.md) | **#29 の決着内容。** 確定した構成と、採らなかった 2 案 |
| 4 | [terraform-scope.md](/project/plan/deploy/terraform-scope.md) | **Terraform で管理するもの・しないものの切り分け** |
| 5 | [layer-close-rest.md](/project/plan/deploy/layer-close-rest.md) | 層 1 — 認証なしの REST を削除（**完了**） |
| 6 | [layer-remove-terraform.md](/project/plan/deploy/layer-remove-terraform.md) | 層 2 — AWS 向け Terraform を削除 |
| 7 | [layer-container.md](/project/plan/deploy/layer-container.md) | 層 3 — `apps/api` のコンテナ化 |
| 8 | [layer-ci.md](/project/plan/deploy/layer-ci.md) | 層 4 — CI の土台 |
| 9 | [layer-config.md](/project/plan/deploy/layer-config.md) | 層 5 — ベタ書き設定の外部化 |
| 10 | [phase-3.md](/project/plan/deploy/phase-3.md) | **段階 3 の輪郭。** #29 の決着が前提 |
| 11 | [explain/](/project/plan/deploy/explain/index.md) | **初学者向けの解説。** 目的・デプロイとは・構成・IaC・無料枠 |

## 層と Issue の対応

| 段階 | 層 | 内容 | Issue | 状態 |
| :- | :- | :- | :- | :- |
| 1 | 1 | 認証なしの `/dummies` を削除 | [#86](https://github.com/Hitamuki/study-web-modern-stack/issues/86) | **完了** |
| 1 | 2 | AWS 向け Terraform を削除 | [#99](https://github.com/Hitamuki/study-web-modern-stack/issues/99) | Backlog |
| 2 | 3 | `apps/api` のコンテナ化 | [#87](https://github.com/Hitamuki/study-web-modern-stack/issues/87) | Backlog |
| 2 | 4 | CI の土台 | [#88](https://github.com/Hitamuki/study-web-modern-stack/issues/88) | Backlog |
| 2 | 5 | ベタ書き設定の外部化 | [#89](https://github.com/Hitamuki/study-web-modern-stack/issues/89) | Backlog |
| 3 | 6 | Terraform 再導入（Cloudflare / Render / GitHub） | [#100](https://github.com/Hitamuki/study-web-modern-stack/issues/100) | Backlog |
| 3 | 7 | DB を Supabase へ | [#101](https://github.com/Hitamuki/study-web-modern-stack/issues/101) | Backlog |
| 3 | 8 | Hasura Cloud に載せる | [#102](https://github.com/Hitamuki/study-web-modern-stack/issues/102) | Backlog |
| 3 | 9 | API を Render に載せる | [#103](https://github.com/Hitamuki/study-web-modern-stack/issues/103) | Backlog |
| 3 | 10 | Web を Cloudflare Workers に載せる | [#104](https://github.com/Hitamuki/study-web-modern-stack/issues/104) | Backlog |
| 3 | 11 | デプロイ CI と Keep Warm | [#105](https://github.com/Hitamuki/study-web-modern-stack/issues/105) | Backlog |

## 次にやること

1. **層 2（#99）に着手する。** 行き先を失った `infra/` を消す
2. 層 3〜5（#87 / #88 / #89）を順に積む
3. **Supabase の一時停止と Render の Keep Warm を 1 つの判断として決める**
   （→ [decision.md](/project/plan/deploy/decision.md) の「残った未検証項目」）

構成図は [docs/context-map.drawio.svg](/docs/context-map.drawio.svg) にあります。

Issue は Board では `Backlog` です。着手を決めた時点で `Todo` に移し、
実施期間（`開始日` / `終了日`）を設定してください（AGENTS.md「Status と実施期間」）。
