# デプロイと Terraform のしくみ（解説）

この計画で何をやろうとしているのかを、**前提知識なしで読める形**にまとめたものです。

順序と依存は [../index.md](/project/plan/deploy/index.md)、
決めるべきことは [../decision.md](/project/plan/deploy/decision.md) にあります。
ここは「なぜ」と「なに」の説明だけです。

## 読む順序

| # | ファイル | 答える問い |
| :- | :- | :- |
| 1 | [goal.md](/project/plan/deploy/explain/goal.md) | 目的はなにか。なぜやるのか |
| 2 | [what-is-deploy.md](/project/plan/deploy/explain/what-is-deploy.md) | デプロイとはなにか。なぜ 1 つのサービスで終わらないのか |
| 3 | [architecture.md](/project/plan/deploy/explain/architecture.md) | 公開するとどういう構成になるのか |
| 4 | [iac.md](/project/plan/deploy/explain/iac.md) | Terraform（IaC）とはなにか。何を任せるのか |
| 5 | [free-tier.md](/project/plan/deploy/explain/free-tier.md) | 無料枠の何が難しいのか |
| 6 | [tech-stack.md](/project/plan/deploy/explain/tech-stack.md) | 技術要素はなにか |

## ひとことで言うと

**いまアプリは「自分のパソコンの中だけ」にあります。** 電源を切れば消えます。

この計画で **「インターネットに置きっぱなしにする」** 状態にします。
しかも**お金をかけずに**、そして**その構成を手作業ではなく設定ファイルで管理する**状態にします。

やることは 3 つです。

| # | やること | たとえると |
| :- | :- | :- |
| 1 | 公開できる状態に直す | **戸締まりをする** |
| 2 | 無料のサービスに置く | **土地を借りて建てる** |
| 3 | 構成を Terraform で書く | **設計図を残す** |

> [!WARNING]
> **いまは戸締まりができていません。** 鍵のかかっていない裏口（`/dummies`）が 1 つ開いており、
> そこから誰でも全員のデータを読み書きできます。
> 詳しくは [../findings.md](/project/plan/deploy/findings.md) の 1 を参照してください。
