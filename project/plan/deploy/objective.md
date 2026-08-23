---
type: Plan
title: 無料枠への常設デプロイ
description: ローカルでしか動いていないアプリを、無料枠のサービスに常設し、Terraform で管理する。
resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/29
tags: [deploy, infra, terraform, 無料枠]
status: draft
stale_after: 2026-09-23
generated: { by: claude-code/claude-fable-5, at: 2026-08-23T10:00:00Z }
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

**段階 1 の Issue は起票済み**（[#86](https://github.com/Hitamuki/study-web-modern-stack/issues/86) / [#87](https://github.com/Hitamuki/study-web-modern-stack/issues/87) / [#88](https://github.com/Hitamuki/study-web-modern-stack/issues/88) / [#89](https://github.com/Hitamuki/study-web-modern-stack/issues/89)）。段階 2 は #29 の決着待ち。 完了条件の正本は各 Issue の AC になるが、
起票前なので現時点の要点を記す。

| # | できていること |
| :- | :- |
| 1 | ブラウザから公開 URL を開き、アカウント作成 → ログイン → 自分のメモの CRUD ができる |
| 2 | 認証を迂回して他人のデータに触れる経路が無い（[findings.md](/project/plan/deploy/findings.md) の 1） |
| 3 | 月額の請求が発生しない |
| 4 | 環境の構成が `infra/` の Terraform に書かれ、`plan` が通る |
| 5 | `main` へのマージから公開環境への反映までが CI で自動化されている |

# 2 つの段階に分かれる

**この計画の要点は「決まっていなくても進められる作業がある」ことである。**

Discussion [#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) は
**未決着**で、Hasura / API / フロントの載せ先が決まっていない。
しかし [findings.md](/project/plan/deploy/findings.md) の 1〜4 が示すとおり、
**このリポジトリは載せ先が決まっても今のままでは載らない。** そこを先に直す。

```text
段階 1: 公開の前提条件をそろえる    ← #29 の決着を待たずに進められる
段階 2: 実際に載せる                ← #29 の決着が必要
```

## 段階 1 — 公開の前提条件（#29 と独立）

| 層 | 内容 | なぜ #29 と独立か |
| :- | :- | :- |
| [1](/project/plan/deploy/layer-close-rest.md) #86 | `/dummies` を塞ぐ（**完了**） | どこに載せても穴は穴 |
| [2](/project/plan/deploy/layer-container.md) #87 | `apps/api` のコンテナ化 | 主要な PaaS はどれも OCI イメージを受け取る |
| [3](/project/plan/deploy/layer-ci.md) #88 | CI の土台（`make check`） | デプロイ先に依存しない |
| [4](/project/plan/deploy/layer-config.md) #89 | ベタ書き設定の外部化 | 「環境変数から読む」形にするところまでは共通 |

**層 1 は #29 と関係なく、いま塞ぐべきものである。** 公開しない現時点でも
`main` に穴が空いたコードが載っている状態に変わりはない。

## 段階 2 — 載せる（#29 の決着後）

→ [phase-2.md](/project/plan/deploy/phase-2.md)

**この計画では段階 2 の各層を詳細化しない。** 載せ先が決まっていない時点で書いた手順は
決着後にほぼ書き直しになるためである。輪郭と依存関係だけを置く。

# 層の積み順

AGENTS.md の積み順（`hasura` → `packages/graphql` → `apps/api` → `apps/web` → `infra`）は
**「下流の依存ほど上」という原則**であり、デプロイでは依存の向きが変わる。

段階 1 は上から順に 1 本のスタックに積む。**層 1 と層 2 は本来独立**だが、
スタックは直線しか作れないため（AGENTS.md「スタックは直線のみ」）順序を付ける。

```text
main
 └ fix/NN-close-dummy-rest      apps/api   → 層 1
  └ build/NN-api-dockerfile     apps/api   → 層 2
   └ ci/NN-check-workflow       .github    → 層 3
    └ refactor/NN-externalize   hasura ほか → 層 4
```

`NN` は起票後の Issue 番号に置き換える。

## なぜ層 1 を最初に置くか

**穴を塞ぐ変更を、他の変更に埋もれさせないため。** 層 1 は差分が小さく、
レビューで「本当に経路が消えたか」だけを見れば済む。
コンテナ化や CI の差分と混ぜると、その確認が埋もれる。

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
  public 化の前提になるため、層 4 で扱う
