---
type: Finding
title: 着手前に知っておくべき事実
description: 無料枠デプロイに入る前に判明した、Discussion #29 の本文には書かれていない事実。
resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/29
tags: [deploy, infra, terraform, 既知の不具合]
status: stable
stale_after: 2026-09-23
generated: { by: claude-code/claude-fable-5, at: 2026-08-23T10:00:00Z }
---

Discussion [#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) は
「どのサービスに載せるか」を論点にしている。**それ以前に、このリポジトリは今のままでは
どのプラットフォームにも安全に載らない。** その理由を並べる。

1〜4 は**公開の前提条件**（プラットフォームの選択に関係なく必要）、
5〜7 は**プラットフォームを選ぶときに効いてくる制約**である。

# 1. `/dummies` が認証なしで公開される（最優先）→ **解消済み（#86）**

`apps/api/src/infrastructure/controllers/dummy.controller.ts` は
**認証が一切なく、所有者をリクエストボディから受け取る。**

```ts
// dummy.controller.ts:57
async create(@Body() dto: { ownerId: string; content: string })
```

> [!NOTE]
> **#86 で解消しました。** `dummy.controller.ts` と、そこからしか呼ばれていなかった
> `ListDummiesUseCase` / `DummyRepository.findAll()` を削除しました。
> 4 メソッドとも 404 を返すことを実測済みです。以下は解消前の記録です。

`dummy.module.ts:26` の `controllers` に登録されており、**当時は有効**だった。
つまり `apps/api` を公開した瞬間に、誰でも次ができた。

| 操作 | 結果 |
| :- | :- |
| `GET /dummies` | **全ユーザーのレコードが読める** |
| `POST /dummies` | 任意の `ownerId` になりすまして作成できる |
| `PATCH /dummies/:id` | 他人のレコードを書き換えられる |
| `DELETE /dummies/:id` | 他人のレコードを削除できる |

Issue [#20](https://github.com/Hitamuki/study-web-modern-stack/issues/20) で入れた
Hasura の行レベル権限は **Hasura を通る経路にしか効かない。** この REST は Hasura を経由せず
Prisma に直行するため、権限を丸ごと迂回する。

コード自身のコメントにも「公開環境に出す前に認証を入れるか、ルーティングごと外す必要がある」と
書かれている。[auth/findings.md](/project/plan/auth/findings.md) の 3 でも
「**この計画のスコープ外。公開前に別 Issue で塞ぐ必要がある**」と記録されたまま、
**Issue が起票されていない。**

→ **デプロイの第 1 層として最初に塞ぐ。** [layer-close-rest.md](/project/plan/deploy/layer-close-rest.md)

# 2. Dockerfile が 1 つも無い

```console
$ find . -name "Dockerfile*" -not -path "*/node_modules/*"
（0 件）
```

`docker-compose.yml` は **公開イメージを引いているだけ**である（`postgres:15` と
`hasura/graphql-engine:v2.20.0`）。`apps/api` は `pnpm` からホスト上で直接起動しており、
**コンテナになったことが一度も無い。**

Hasura は公式イメージがあるのでそのまま載る。**`apps/api` だけがビルド対象になる。**
pnpm workspace + Catalogs + Prisma の組み合わせは素直に書くと失敗しやすい。

| 論点 | 内容 |
| :- | :- |
| workspace の依存 | `apps/api` 単体では `pnpm install` が通らない。ルートの `pnpm-lock.yaml` と `pnpm-workspace.yaml` が要る |
| Catalogs | `catalog:backend` はロックファイル経由でしか解決できない。`package.json` だけコピーしても駄目 |
| Prisma | `postinstall` の `prisma generate` がビルド時に走る。生成物をランタイムイメージへ持ち越す必要がある |
| ネイティブ依存 | Prisma のクエリエンジンは OS/libc 依存。Alpine（musl）と Debian（glibc）で別バイナリになる |

# 3. CI が存在しない

```console
$ ls .github/workflows
No such file or directory
```

**`.github/workflows` ディレクトリごと無い。** `make check`（format-check / lint / test）は
ローカルでしか回っていない。

デプロイは「ビルドして成果物を送る」処理なので、**CI が無い状態ではデプロイの自動化も無い。**
Wiki [Infra](https://github.com/Hitamuki/study-web-modern-stack/wiki/Infra) の一覧でも
CI・デプロイともに「（未導入）」である。

つまりこの計画は **CI の新規導入を含む。** Discussion #29 の「影響範囲」表にある
「CI: デプロイの自動化が必要になる（`.github/workflows` が未整備）」がこれにあたる。

## `make check` はテストを 1 件も実行していない

`main` で `make check` は**通る**（確認日 2026-08-24）。ただし内訳が問題である。

```console
pnpm exec turbo run test
No tasks were executed as part of this run.
 Tasks:    0 successful, 0 total
```

`turbo.json` に `test` タスクの定義はあるが、**`test` スクリプトを持つパッケージが 1 つも無い。**
`@memo-app/api` / `@memo-app/web` / `@memo-app/mobile` / `desktop` / `@repo/graphql` のいずれにも無い。

**`make check` が担保しているのは整形（Biome）と lint（ESLint）だけ**であり、
振る舞いの回帰は検出されない。DoD で `make check` を通すことは
「動作が壊れていないこと」を意味しない。デプロイを自動化する前に認識しておく必要がある。

# 4. ローカル前提の設定が各所にベタ書きされている

環境変数化されていない値が残っている。デプロイ先が決まっても、**これを外に出さないと動かない。**

| ファイル | 値 | 問題 |
| :- | :- | :- |
| `hasura/config.yaml:2` | `endpoint: http://localhost:8080` | 本番の Hasura を向けられない |
| `hasura/config.yaml:3` | `admin_secret: myadminsecretkey` | **平文でコミット済み。** 本番は別の値にする必要がある |
| `packages/graphql/codegen.ts:7` | `?? "myadminsecretkey"` | 同上（既定値としてのフォールバック） |
| `docker-compose.yml:29` | `HASURA_GRAPHQL_CORS_DOMAIN: "*"` | 全オリジンを許可。公開時は Web のオリジンに絞る |
| `hasura/config.yaml:7` | `handler_webhook_base_url: http://host.docker.internal:3001` | Docker Desktop 固有の名前。クラウドでは解決できない |
| `apps/web/src/shared/config/env.ts:8` | `?? "http://localhost:8080/v1/graphql"` | 未設定時に localhost へ落ちる。ビルド時に注入が要る |

`hasura/config.yaml` の `admin_secret` は**平文でリポジトリに入っている**ため、
リポジトリを public にする場合（Discussion
[#41](https://github.com/Hitamuki/study-web-modern-stack/discussions/41)）は
**本番の admin secret をこれと別の値にするだけでなく、この行自体を環境変数参照に変える**必要がある。

`apps/api` 側は `process.env.PORT ?? 3001` を読んでいる（`main.ts:9`）ため、
**PaaS が注入する `PORT` にそのまま追随できる。** ここは直す必要がない。

# 5. Supabase の一時停止は「DB を移せば解決」ではない

Discussion #29 のコメントで「7 日間の低活動で一時停止、90 日で永久削除」が確認済みである。
そのうえで**判定は "user database activity" ベース**という点が効いてくる。

現在 Supabase は**認証にしか使っていない**（アプリの DB はローカルの Docker）。
アプリの DB も Supabase へ移せば DB アクセスが発生するようになるが、
**学習プロジェクトには利用者がいない。** 自分がアクセスしない週があれば止まる。

| 案 | 評価 |
| :- | :- |
| 気にしない（止まったら手で戻す） | 90 日以内に気づけば復旧できる。**常設という当初の目的は満たさない** |
| cron で定期 ping する | #29 のコメント自身が「**サービスの想定利用から外れた運用**」と留保を付けている |
| DB を Supabase 以外にする | 認証と DB が分かれ、#29 の評価軸 3 で不利。**#19 の決定と噛み合わない** |

**この 3 択は #29 で決めることであり、この計画では決めない。**

なお**無料プロジェクトは 2 つまで**なので、本番用と検証用に分けると枠を使い切る。
現在 1 つ（`kdhyeuasgxdlkzwqfbij`）を認証で使用中である。

# 6. アプリの DB を Supabase へ移すと、接続経路の制約が付く

現在 Hasura は同じ Docker ネットワーク内の Postgres へ `postgres://user:password@postgres:5432/memo` で
繋いでいる。Supabase の Postgres へ向けると、次が新しく問題になる。

| 論点 | 内容 |
| :- | :- |
| 接続文字列の種類 | Supabase は direct / transaction pooler / session pooler の 3 種を出し分ける。**Hasura と Prisma で適切なものが違う** |
| IPv4 / IPv6 | direct 接続は IPv6 のみ。ホスティング先が IPv4 しか持たない場合は pooler 経由が必須になる |
| コネクション数 | 無料枠の上限は小さい。Hasura は既定でプールを張り続けるため、`HASURA_GRAPHQL_PG_CONNECTIONS` の調整が要る |
| マイグレーション | `prisma db push` の向き先が変わる。**`make backend-init` はローカル固定**なので本番用の経路が別に要る |

DB の正本は Prisma（`hasura/README.md` の役割分担）なので、
**本番へのスキーマ反映も Prisma から流す**ことになる。CI から実行する経路が必要。

# 7. `infra/` の Terraform は、行き先を失っている

`infra/main.tf` は AWS の VPC / Subnet / IGW / Route Table / SG / **RDS** を定義している。
これは Discussion #29 が「**RDS を常時起動すると費用が発生する**ため常設に向かない」として
避けようとしている当のものである。

つまり **`infra/` の中身は、この計画で作る環境と 1 つも重ならない。**

さらに `main.tf` は **一度も `apply` されていない**（Wiki [Infra](https://github.com/Hitamuki/study-web-modern-stack/wiki/Infra) の
「デプロイ: （未導入）」、README の成功条件 5 が未達）。`main.tftest.hcl` は `plan` に対する
アサーションなので、**apply しなくても通る。**

## README の成功条件と両立しない

README の【成功の定義】は 5 項目あり、Terraform に関わるのは 2 つである。

| # | 内容 | 無料枠デプロイとの関係 |
| :- | :- | :- |
| 2 | Terraform で `plan` が通り、`test` が成功すること | **両立する。** apply は要求していない |
| 5 | **AWS でサービスが稼働すること** | **両立しない。** AWS で常設すると課金される |

【目的】側も「Terraform の**ローカル品質管理**（fmt, lint, plan, test）を実践する」であり、
**apply を求めていない。** 衝突しているのは成功条件 5 だけである。

**成功条件 5 を書き換えるか、未達として残すかは人間の判断**であり、この計画では決めない。
→ [terraform-scope.md](/project/plan/deploy/terraform-scope.md) に選択肢を整理する。

# 8. Issue #27 の位置づけが変わる

Issue [#27](https://github.com/Hitamuki/study-web-modern-stack/issues/27)（Terraform の本番前セキュリティ設定）は
**RDS の `storage_encrypted` やバックアップ保持期間**を対象にしている。

AWS へデプロイしないなら、**#27 の対象リソースは存在しないまま**になる。
Discussion #29 の「影響範囲」表も「AWS へデプロイしない方針になるなら、優先度が下がる」と書いている。

一方で **TLS の有効化**は #27 に含まれており、こちらは無料枠デプロイでも必要になる。
ただし主要な PaaS は HTTPS を自動で終端するため、**Terraform で書く対象ではなくなる**可能性が高い。

→ #29 の決着後に **#27 を分割するか閉じるかの判断**が要る。
