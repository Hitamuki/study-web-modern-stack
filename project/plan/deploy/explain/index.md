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

やることは 3 つで、この順に進めます。

| # | やること | たとえると |
| :- | :- | :- |
| 1 | 要らない構成を捨てる | **更地にする** |
| 2 | 公開できる状態に直す | **戸締まりをする** |
| 3 | 無料のサービスに置き、構成を Terraform で書く | **土地を借りて建て、設計図を残す** |

AWS を使う予定が無くなったため、**いま置いてある Terraform（`infra/`）は一度すべて消します。**
Terraform をやめるのではなく、**載せ先が決まってから無料枠のサービス向けに書き直す**ためです。
→ [iac.md](/project/plan/deploy/explain/iac.md)

> [!NOTE]
> **裏口は閉じました。** 鍵のかかっていなかった `/dummies` は #86 で削除しました。
> 残る入口は Hasura（行レベル権限つき）と Hasura Actions（共有シークレットつき）だけです。
> 経緯は [../findings.md](/project/plan/deploy/findings.md) の 1 を参照してください。
