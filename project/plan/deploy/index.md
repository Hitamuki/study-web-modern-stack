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
> **段階 1 と段階 2 は完了しました**（2026-09-06）。認証なしの `/dummies` を削除し、
> 行き先を失った `infra/` を消し、`apps/api` のコンテナ化・CI の土台・設定の外部化まで終わっています。
> **残るのは段階 3（層 6〜11）だけ**で、ここから先は外部サービスの操作が挟まります（下記「次にやること」）。

> [!WARNING]
> **完了条件 4（`plan` が通る）は、いま満たせません。** 層 2 で `infra/` を削除したためです。
> 想定どおりの中間状態で、**層 6（#100）で回復します**（→ [objective.md](/project/plan/deploy/objective.md)）。

## 読む順序

| # | ファイル | 内容 |
| :- | :- | :- |
| 1 | [objective.md](/project/plan/deploy/objective.md) | 何を達成すれば完了なのか。**3 つの段階に分かれる理由** |
| 2 | [findings.md](/project/plan/deploy/findings.md) | **着手前に知っておくべき 8 つの事実** |
| 3 | [decision.md](/project/plan/deploy/decision.md) | **#29 の決着内容。** 確定した構成と、採らなかった 2 案 |
| 4 | [terraform-scope.md](/project/plan/deploy/terraform-scope.md) | **Terraform で管理するもの・しないものの切り分け** |
| 5 | [layer-close-rest.md](/project/plan/deploy/layer-close-rest.md) | 層 1 — 認証なしの REST を削除（**完了**） |
| 6 | [layer-remove-terraform.md](/project/plan/deploy/layer-remove-terraform.md) | 層 2 — AWS 向け Terraform を削除（**完了**） |
| 7 | [layer-container.md](/project/plan/deploy/layer-container.md) | 層 3 — `apps/api` のコンテナ化（**完了**） |
| 8 | [layer-ci.md](/project/plan/deploy/layer-ci.md) | 層 4 — CI の土台（**完了**） |
| 9 | [layer-config.md](/project/plan/deploy/layer-config.md) | 層 5 — ベタ書き設定の外部化（**完了**） |
| 10 | [phase-3.md](/project/plan/deploy/phase-3.md) | **段階 3 の輪郭。** #29 の決着が前提 |
| 11 | [explain/](/project/plan/deploy/explain/index.md) | **初学者向けの解説。** 目的・デプロイとは・構成・IaC・無料枠 |

## 層と Issue の対応

| 段階 | 層 | 内容 | Issue | 状態 |
| :- | :- | :- | :- | :- |
| 1 | 1 | 認証なしの `/dummies` を削除 | [#86](https://github.com/Hitamuki/study-web-modern-stack/issues/86) | **完了** |
| 1 | 2 | AWS 向け Terraform を削除 | [#99](https://github.com/Hitamuki/study-web-modern-stack/issues/99) | **完了** |
| 2 | 3 | `apps/api` のコンテナ化 | [#87](https://github.com/Hitamuki/study-web-modern-stack/issues/87) | **完了** |
| 2 | 4 | CI の土台 | [#88](https://github.com/Hitamuki/study-web-modern-stack/issues/88) | **完了** |
| 2 | 5 | ベタ書き設定の外部化 | [#89](https://github.com/Hitamuki/study-web-modern-stack/issues/89) | **完了** |
| 3 | 6 | Terraform 再導入（Cloudflare / Render / GitHub） | [#100](https://github.com/Hitamuki/study-web-modern-stack/issues/100) | Backlog |
| 3 | 7 | DB を Supabase へ | [#101](https://github.com/Hitamuki/study-web-modern-stack/issues/101) | Backlog |
| 3 | 8 | Hasura Cloud に載せる | [#102](https://github.com/Hitamuki/study-web-modern-stack/issues/102) | Backlog |
| 3 | 9 | API を Render に載せる | [#103](https://github.com/Hitamuki/study-web-modern-stack/issues/103) | Backlog |
| 3 | 10 | Web を Cloudflare Workers に載せる | [#104](https://github.com/Hitamuki/study-web-modern-stack/issues/104) | Backlog |
| 3 | 11 | デプロイ CI と Keep Warm | [#105](https://github.com/Hitamuki/study-web-modern-stack/issues/105) | Backlog |

## 次にやること

**層 6（#100 / Terraform の再導入）に着手する。** ただし、ここから先は**人間の操作が前提**になります。

### 着手前に人間がやること

**エージェントは代行できません。** アカウントの作成、トークンの発行、支払い手段の登録、
外部サービスのダッシュボード操作が該当します。

| # | やること | 何のため | 層 |
| :- | :- | :- | :- |
| 1 | **Cloudflare の API トークンを発行する**（最小権限） | Terraform が Workers と DNS を操作するため | 6 |
| 2 | **Render のアカウントを作り、API キーを発行する** | Terraform が Web Service を宣言するため | 6 |
| 3 | 発行したトークンを **`gh secret set` で登録する** | secret は Terraform で作らない（state に平文で入る） | 6 |
| 4 | **`terraform apply` の実行を承認する** | 実サービスが作られる | 6 |
| 5 | **Supabase の 2 つ目のプロジェクトを作る**（本番用） | 開発用と本番用で無料枠 2 つを使い切る | 7 |
| 6 | Supabase の**接続文字列と DB パスワード**を控える | direct / transaction pooler / session pooler の使い分け | 7 |
| 7 | **Hasura Cloud のプロジェクトを作る** | Terraform のプロバイダが無く、ダッシュボード操作になる | 8 |
| 8 | **UptimeRobot の監視を設定する** | Keep Warm | 11 |

> [!NOTE]
> **ネームサーバーの委任は不要です。** `sk8trickhub.com` は **Cloudflare Registrar** で取得したため
> （[#98](https://github.com/Hitamuki/study-web-modern-stack/issues/98)）、ゾーンは最初から Cloudflare にあり、
> DNS レコードを追加できる状態です。

> [!IMPORTANT]
> **`terraform apply` の state はローカルに置きます**（暫定 / 2026-09-06 の判断）。
> つまり **CI から `apply` しません。** リモート state の検討は必要になった時点で行います
> （→ [terraform-scope.md](/project/plan/deploy/terraform-scope.md) の「state の置き場所」）。

### 決着していない判断

**Supabase の一時停止と Render の Keep Warm は 1 つの判断として決める**
（→ [decision.md](/project/plan/deploy/decision.md) の「残った未検証項目」）。
片方だけ許容する理屈は立ちません。

構成図は [docs/context-map.drawio.svg](/docs/context-map.drawio.svg) にあります。

着手を決めた Issue は Board で `Todo` に移し、実施期間（`開始日` / `終了日`）を
設定してください（AGENTS.md「Status と実施期間」）。
