# 認証・認可の導入

Issue [#20](https://github.com/Hitamuki/study-web-modern-stack/issues/20) の実装計画です。

**目的**: `apps/web` から Hasura の admin secret を消し、ログインしたユーザーが自分のレコードだけを読み書きできる状態にする。

## 読む順序

| # | ファイル | 内容 |
| :- | :- | :- |
| 1 | [objective.md](/project/plan/auth/objective.md) | 何を達成すれば完了なのか。層の積み順 |
| 2 | [findings.md](/project/plan/auth/findings.md) | **着手前に知っておくべき 5 つの事実**（`main` が壊れている件を含む） |
| 3 | [supabase-setup.md](/project/plan/auth/supabase-setup.md) | ユーザー作業。**これが済むまで実装に入れない** |
| 4 | [layer-hasura-jwt.md](/project/plan/auth/layer-hasura-jwt.md) | 層 1 |
| 5 | [layer-apollo-jwt.md](/project/plan/auth/layer-apollo-jwt.md) | 層 2 |
| 6 | [layer-actions-guard.md](/project/plan/auth/layer-actions-guard.md) | 層 3 |
| 7 | [layer-web-router.md](/project/plan/auth/layer-web-router.md) | 層 4 |
| 8 | [layer-web-auth.md](/project/plan/auth/layer-web-auth.md) | 層 5 |
| 9 | [verification.md](/project/plan/auth/verification.md) | 全層が入った後の検証手順 |

## いま止まっている理由

**ユーザーの作業が 2 つ揃うまで層 1 に入れません。**

1. Supabase プロジェクトの作成 → [supabase-setup.md](/project/plan/auth/supabase-setup.md)
2. ルーターの選定（Discussion の Answer）→ [layer-web-router.md](/project/plan/auth/layer-web-router.md)
