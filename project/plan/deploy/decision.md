---
type: Decision
title: Discussion #29 で決めること
description: 載せ先の選定のうち、何が既に拘束され、何が未決で、何がこの計画では決められないか。
resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/29
tags: [deploy, 技術選定, ブロッカー]
status: draft
stale_after: 2026-09-24
generated: { by: claude-code/claude-fable-5, at: 2026-08-24T00:00:00Z }
---

# この計画は載せ先を決めない

**選定は Discussion [#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) の仕事である。**
計画が結論を先取りすると、AGENTS.md の「結論だけをコミットに残さず、
なぜ他を選ばなかったかを後から人間が読める形にする」に反する。

ここに書くのは **#29 に持ち込むべき材料**と、**決着を待つ範囲の切り分け**だけである。

> [!IMPORTANT]
> **無料枠の具体的な数値（帯域・RAM・休止時間など）をこの計画に書いていないのは意図的である。**
> #29 の本文自身が「無料枠の条件は変動が激しいため、値は空欄にしている。
> **検証時に各公式から確認日付つきで埋める**」としている。
> 数値の正本は #29 であり、ここに写すと二重管理になり、古い値が残る。

# 既に拘束されている部分

| 要素 | 状態 | 根拠 |
| :- | :- | :- |
| **PostgreSQL** | **Supabase でほぼ確定** | Discussion [#19](https://github.com/Hitamuki/study-web-modern-stack/discussions/19) で認証に Supabase Auth を採用。DB を別サービスにすると #29 の評価軸 3 で不利。#29 のコメントで追記済み |

# 未決着の部分

#29 のコメントが挙げた 3 つがそのまま残っている。**決める順序は制約の強い順**（#29 本文の「決め方の順序」）。

| 順 | 要素 | 最大の論点 |
| :- | :- | :- |
| 1 | **GraphQL エンジン（Hasura）** | 常時起動のコンテナを無料で確保できるか。**ここが全体を決める** |
| 2 | API（`apps/api` / NestJS） | Hasura の載せ先に引きずられる（Actions の呼び出し経路） |
| 3 | 静的フロント（`apps/web`） | 難易度は低い。最後でよい |

**Hasura が決まらないと API も決まらない。** Hasura は Actions のハンドラを
HTTP で呼ぶため、両者が同じプラットフォームなら内部ネットワークで済み、
別なら公開エンドポイントと共有シークレットでの保護が要る（既に実装済み）。

# #29 に足りていない評価軸

**「Terraform で管理できるか」が #29 の評価軸に無い。**

#29 の評価軸は 6 つ（無料枠で常設 / 休止条件 / 賄える要素数 / Hasura を動かせるか / 学習価値 / 移行コスト）で、
IaC で管理できるかは入っていない。しかし本プロジェクトは README の【目的】に
Terraform を掲げており、**この軸で候補が実際に絞られる。**

→ 検証結果は [terraform-scope.md](/project/plan/deploy/terraform-scope.md) の
「プロバイダの実態」にまとめた。**Terraform プロバイダが実質使えない候補が複数ある。**

**#29 に評価軸 7 として追記することを提案する。** 追記はコメントで行い、本文の書き換えはしない
（AGENTS.md「本文を書き換えて結論だけ残さない」）。

# #29 の未検証項目

コメントに残っている 3 つ。**いずれも人間の判断が要る**ため、この計画では埋められない。

- [ ] 通常のアクセスで Supabase の一時停止を回避できるか
- [ ] cron で定期 ping する回避策を前提としてよいか（**サービスの想定利用から外れた運用**）
- [ ] 無料プロジェクト 2 つの上限を、本番用と検証用で使い切ることを許容するか

→ 背景は [findings.md](/project/plan/deploy/findings.md) の 5 を参照。

# 決着していなくても進められること

**#29 の決着を待つ必要があるのは段階 2 だけである。**
段階 1（層 1〜4）は載せ先に依存しない。→ [objective.md](/project/plan/deploy/objective.md)

これは「DoR を満たさない Issue に着手しない」に反しない。
**層 1〜4 の Issue は #29 を DoR に持たない**（載せ先に依存しないため）。
段階 2 の Issue にだけ「Discussion #29 が決着している」を DoR として入れる。
