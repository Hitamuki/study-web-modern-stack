---
type: Plan
title: 無料枠への常設デプロイ
description: 現状の構成を削除し、デプロイ準備をして、無料枠のサービスに常設する。Terraform は段階 3 で作り直す。
resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/29
tags: [deploy, infra, terraform, 無料枠]
status: draft
stale_after: 2026-10-05
generated: { by: claude-code/claude-opus-5, at: 2026-09-05T00:00:00Z }
sources:
  - resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/29
    title: ホスティング先の選定（無料枠での常設）
  - resource: https://github.com/Hitamuki/study-web-modern-stack/wiki/Infra
    title: Wiki Infra
---

# 目的

このアプリは**ローカルの Docker Compose でしか動いていない。** 公開環境が無い。

**無料枠のサービスに常設し、`infra/` の Terraform でその構成を管理する状態にする。**

# 完了条件

完了条件の正本は各 Issue の AC である。全体としての到達点は 5 つ。

| # | できていること |
| :- | :- |
| 1 | ブラウザから公開 URL を開き、アカウント作成 → ログイン → 自分のメモの CRUD ができる |
| 2 | 認証を迂回して他人のデータに触れる経路が無い（[findings.md](/project/plan/deploy/findings.md) の 1） |
| 3 | 月額の請求が発生しない |
| 4 | Cloudflare / Render / GitHub の構成が `infra/` の Terraform に書かれ、`plan` が通る |
| 5 | `main` へのマージから公開環境への反映までが CI で自動化されている |

> [!NOTE]
> **4 は一度失われてから戻る。** 層 2 で AWS 向けの `infra/` を削除するため、
> 段階 2 の間は `plan` する対象がない。段階 3 の層 6 で作り直して回復させる。

# 3 つの段階に分かれる

**この計画の要点は 2 つある。**

1. **要らないものを先に消す。** 行き先を失った構成を抱えたまま新しいものを足さない
2. **載せ先と無関係に必要な作業がある。** Discussion
   [#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) は
   2026-09-06 に決着したが、[findings.md](/project/plan/deploy/findings.md) の 1〜4 が示すとおり
   **このリポジトリは載せ先が決まっても今のままでは載らない**

```text
段階 1: 現状の構成を削除     ← 引き算
段階 2: デプロイ準備         ← 載せ先に依存しない足し算
段階 3: 実際に載せる         ← 載せ先が確定（#29 / 2026-09-06）
```

## 段階 1 — 現状の構成を削除

**公開する前に消すべきものを消す。** どちらも足し算ではなく引き算である。

| 層 | 内容 | Issue | 状態 |
| :- | :- | :- | :- |
| [1](/project/plan/deploy/layer-close-rest.md) | 認証なしの `/dummies` を削除 | [#86](https://github.com/Hitamuki/study-web-modern-stack/issues/86) | **完了** |
| [2](/project/plan/deploy/layer-remove-terraform.md) | AWS 向け Terraform（`infra/`）を削除 | [#99](https://github.com/Hitamuki/study-web-modern-stack/issues/99) | Backlog |

**層 2 は「Terraform をやめる」変更ではない。** AWS を使う予定が無くなったため
行き先を失ったコードを消すだけで、段階 3 で無料枠プラットフォーム向けに作り直す。
→ [terraform-scope.md](/project/plan/deploy/terraform-scope.md)

## 段階 2 — デプロイ準備（載せ先に依存しない）

| 層 | 内容 | Issue | なぜ載せ先に依存しないか |
| :- | :- | :- | :- |
| [3](/project/plan/deploy/layer-container.md) | `apps/api` のコンテナ化 | [#87](https://github.com/Hitamuki/study-web-modern-stack/issues/87) | 主要な PaaS はどれも OCI イメージを受け取る |
| [4](/project/plan/deploy/layer-ci.md) | CI の土台（`make check`） | [#88](https://github.com/Hitamuki/study-web-modern-stack/issues/88) | デプロイ先に依存しない |
| [5](/project/plan/deploy/layer-config.md) | ベタ書き設定の外部化 | [#89](https://github.com/Hitamuki/study-web-modern-stack/issues/89) | 「環境変数から読む」形にするところまでは共通 |

## 段階 3 — 実際に載せる

| 層 | 内容 | Issue |
| :- | :- | :- |
| 6 | Terraform 再導入（Cloudflare / Render / GitHub） | [#100](https://github.com/Hitamuki/study-web-modern-stack/issues/100) |
| 7 | DB を Supabase へ | [#101](https://github.com/Hitamuki/study-web-modern-stack/issues/101) |
| 8 | Hasura Cloud に載せる | [#102](https://github.com/Hitamuki/study-web-modern-stack/issues/102) |
| 9 | API を Render に載せる | [#103](https://github.com/Hitamuki/study-web-modern-stack/issues/103) |
| 10 | Web を Cloudflare Workers に載せる | [#104](https://github.com/Hitamuki/study-web-modern-stack/issues/104) |
| 11 | デプロイ CI と Keep Warm | [#105](https://github.com/Hitamuki/study-web-modern-stack/issues/105) |

→ 各層の論点は [phase-3.md](/project/plan/deploy/phase-3.md)

# 層の積み順

AGENTS.md の積み順（`hasura` → `packages/graphql` → `apps/api` → `apps/web` → `infra`）は
**「下流の依存ほど上」という原則**であり、デプロイでは依存の向きが変わる。

段階 1・2 の残りは上から順に 1 本のスタックに積む。**層 2 と層 3 は本来独立**だが、
スタックは直線しか作れないため（AGENTS.md「スタックは直線のみ」）順序を付ける。

```text
main
 └ chore/99-remove-aws-terraform   infra      → 層 2
  └ build/87-api-dockerfile        apps/api   → 層 3
   └ ci/88-check-workflow          .github    → 層 4
    └ refactor/89-externalize      hasura ほか → 層 5
```

`NN` は起票後の Issue 番号に置き換える。

## なぜ削除を最初に置くか

**消す変更と足す変更を混ぜないため。** 層 2 の差分は「消えたこと」だけを見れば済む。
コンテナ化や CI の差分と混ぜると、その確認が埋もれる。

層 1（`/dummies` の削除）を最初に置いたのも同じ理由である。

# 対象外

- `apps/mobile` / `apps/desktop` のデプロイ（開発停止中。Discussion #29 の前提）
- 独自ドメインの取得。サービス名（Discussion
  [#46](https://github.com/Hitamuki/study-web-modern-stack/discussions/46)）が未決のため。
  **各プラットフォームが配るサブドメインで公開できる**ので、この計画はドメインを待たない
- 認証メールを第三者に届けること（Issue [#71](https://github.com/Hitamuki/study-web-modern-stack/issues/71)）。
  自分のアドレス宛なら確認できる（[auth/email-delivery.md](/project/plan/auth/email-delivery.md)）
- 監視・ロギングの整備（Wiki
  [Observability](https://github.com/Hitamuki/study-web-modern-stack/wiki/Observability)）
- リポジトリの可視性の決定（Discussion
  [#41](https://github.com/Hitamuki/study-web-modern-stack/discussions/41)）。
  ただし [findings.md](/project/plan/deploy/findings.md) の 4（平文の admin secret）は
  public 化の前提になるため、層 5 で扱う
