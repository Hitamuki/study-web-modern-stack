---
type: Plan
title: 段階 2 — 実際に載せる
description: Discussion #29 の決着後に着手する層の輪郭と依存関係。詳細は決着後に書く。
resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/29
tags: [deploy, infra, terraform, 段階2]
status: draft
stale_after: 2026-09-24
generated: { by: claude-code/claude-fable-5, at: 2026-08-24T00:00:00Z }
---

> [!IMPORTANT]
> **この段階は Discussion [#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) の
> 決着が DoR である。** 各層の Issue には「Discussion #29 が決着している」を入れる。

# 詳細を書かない理由

**載せ先が決まっていない時点で手順を書くと、決着後にほぼ全部書き直しになる。**
プラットフォームごとに、コンテナの渡し方・環境変数の入れ方・
Terraform で書ける範囲（→ [terraform-scope.md](/project/plan/deploy/terraform-scope.md)）がすべて違う。

ここには**順序と依存関係だけ**を置く。AGENTS.md の
「書くのは『どの順で何をやるか』『何が何をブロックしているか』だけ」に従う。

# 層の輪郭

順序は Discussion #29 本文の「決め方の順序」（**DB → GraphQL エンジン → API → フロント**）に、
土台（Terraform）と仕上げ（CI）を足したものである。

| 層 | 内容 | 何に依存するか |
| :- | :- | :- |
| **5** | **Terraform の土台** | #29（どのプロバイダを入れるか）。→ [terraform-scope.md](/project/plan/deploy/terraform-scope.md) |
| **6** | **DB を Supabase へ** | 層 5。DB は**ほぼ確定**（#19 による） |
| **7** | **Hasura を載せる** | 層 6（接続先が要る）。**#29 の最大の論点** |
| **8** | **API を載せる** | 層 7（Actions の呼び出し経路が決まる） |
| **9** | **Web を載せる** | 層 7・8（`VITE_GRAPHQL_URL` の値が決まる） |
| **10** | **デプロイの CI** | 層 3（CI の土台）と 5〜9 すべて |

```text
#29 決着
 └ 層 5  Terraform の土台（state / プロバイダ / infra 再編）
  └ 層 6  DB（Supabase へスキーマを流す）
   └ 層 7  Hasura        ← ここが決まらないと 8・9 が決まらない
    └ 層 8  API（NestJS）
     └ 層 9  Web（静的）
      └ 層 10 デプロイの CI
```

# 各層で解く必要がある問題

**答えではなく、問いを置いている。**

## 層 5 — Terraform の土台

- state をどこに置くか（→ [terraform-scope.md](/project/plan/deploy/terraform-scope.md) の「state の置き場所」）
- `infra/` を `aws/` と `app/` に分けるか
- README の成功条件 5（AWS 稼働）をどう扱うか。**人間の判断が要る**

## 層 6 — DB を Supabase へ

[findings.md](/project/plan/deploy/findings.md) の 6 の 4 つがそのまま論点になる。

- Hasura と Prisma に**どの接続文字列**を使うか（direct / transaction pooler / session pooler）
- コネクション数の上限に対して `HASURA_GRAPHQL_PG_CONNECTIONS` をどう設定するか
- 本番へのスキーマ反映を**どこから流すか**（`make backend-init` はローカル固定）
- 認証と同じプロジェクトに同居させるか（無料プロジェクトは 2 つまで）

## 層 7 — Hasura を載せる

- **常時起動か、スリープを許容するか。** スリープするとコールドスタートが体感に出る
- メタデータをいつ適用するか（`hasura metadata apply` を CI のどこで走らせるか）
- `HASURA_GRAPHQL_ENABLE_CONSOLE` を本番で無効にする
- admin secret を**ローカルと別の値**にする（→ [layer-config.md](/project/plan/deploy/layer-config.md)）

## 層 8 — API を載せる

- イメージのレジストリをどこにするか（層 2 で保留した論点）
- Hasura と同じプラットフォームなら内部通信、別なら公開エンドポイント。
  **後者でも共有シークレットによる保護は実装済み**（Issue #26）
- `ACTION_BASE_URL` の値が決まる

## 層 9 — Web を載せる

- ビルド時に `VITE_*` を注入する経路（**ビルド成果物に埋め込まれる**ため CI で渡す）
- SPA のフォールバック設定（React Router v7 / Issue #76）
- Hasura 側の `HASURA_GRAPHQL_CORS_DOMAIN` をこのオリジンに絞る

## 層 10 — デプロイの CI

- `main` へのマージで何を出すか。**Terraform の `apply` を CI に含めるか**
- 秘匿値の流し方（→ [terraform-scope.md](/project/plan/deploy/terraform-scope.md) の「秘匿値の置き場所」）
- 段階 1 の層 3 で入れた `check.yml` との関係

# この段階の後に残るもの

| 項目 | 状態 |
| :- | :- |
| 独自ドメイン | Discussion [#46](https://github.com/Hitamuki/study-web-modern-stack/discussions/46)（サービス名）待ち。**サブドメインで公開できるので待たない** |
| 認証メールの第三者への到達 | Issue [#71](https://github.com/Hitamuki/study-web-modern-stack/issues/71)。#46 待ち |
| Issue [#27](https://github.com/Hitamuki/study-web-modern-stack/issues/27) | AWS へ出さないなら対象リソースが無い。**分割か close の判断**（→ [findings.md](/project/plan/deploy/findings.md) の 8） |
| 自動テスト | **1 件も無い**（→ [layer-ci.md](/project/plan/deploy/layer-ci.md)）。別 Issue |
| `apps/mobile` / `apps/desktop` | 開発停止中。デプロイ対象外 |
| 監視・ロギング | 未着手 |
