---
type: Plan
title: Terraform で何を管理するか
description: Terraform と CI の境界、プロバイダの実態、既存の AWS コードの処遇。
resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/29
tags: [deploy, terraform, infra, iac]
status: draft
stale_after: 2026-09-24
generated: { by: claude-code/claude-fable-5, at: 2026-08-24T00:00:00Z }
---

# 境界: 箱は Terraform、中身は CI

**「Terraform でインフラを管理する」を「全部 Terraform で書く」と読むと失敗する。**

判定基準は 1 つ。**コミットのたびに変わるか。**

| | 変わる頻度 | 担当 | 例 |
| :- | :- | :- | :- |
| **箱** | めったに変わらない | **Terraform** | サービスの存在、環境変数の「キー」、ドメイン、権限、DB インスタンス |
| **中身** | コミットのたびに変わる | **CI** | ビルドしたイメージ、静的ファイル、Hasura のメタデータ、Prisma のスキーマ |

**デプロイのたびに `terraform apply` を回す構成にしない。**
そうすると「アプリのバージョン」が state に入り、state が履歴を持たないため、
**誰がいつ何を出したかが追えなくなる。** それは Git と CI のログの仕事である。

## この構成での具体的な割り当て

| 対象 | 担当 | 理由 |
| :- | :- | :- |
| 静的サイトのプロジェクト / 独自ドメイン / DNS | Terraform | 一度作れば変わらない |
| コンテナサービスの定義（CPU・メモリ・環境変数のキー） | Terraform | 同上 |
| Supabase のプロジェクトと設定 | Terraform | 同上（ただし下記の制約あり） |
| GitHub Actions の secrets / variables | Terraform | `integrations/github` で宣言できる |
| **アプリのビルドとデプロイ** | **CI** | コミットのたびに変わる |
| **Hasura のメタデータ** | **CI** | `hasura metadata apply` が正本。Terraform に相当する概念が無い |
| **DB のスキーマ** | **CI** | Prisma が正本（`hasura/README.md` の役割分担） |
| **秘匿値そのもの** | **どちらでもない** | 下記「秘匿値の置き場所」を参照 |

# プロバイダの実態（確認日 2026-08-24）

**候補ごとに Terraform で書ける範囲がまったく違う。** Terraform Registry の API で確認した。

| プロバイダ | 種別 | 最新 | 最終公開 | デプロイ対象そのものを宣言できるか |
| :- | :- | :- | :- | :- |
| `cloudflare/cloudflare` | partner | 5.23.0 | 2026-08-05 | **できる**（`pages_project` / `workers_script` / `r2_bucket` / `dns_record`。全 257 資源） |
| `vercel/vercel` | partner | 5.12.0 | 2026-08-20 | **できる**（`project` / `deployment` / `project_domain` / `project_environment_variable`。全 52 資源） |
| `render-oss/render` | partner | 1.9.1 | 2026-07-22 | **できる**（`web_service` / `static_site` / `postgres` / `env_group`。全 17 資源） |
| `hashicorp/google` | official | 7.45.0 | 2026-08-18 | **できる**（`google_cloud_run_v2_service` ほか） |
| `integrations/github` | partner | 6.13.0 | 2026-07-08 | **できる**（Actions の secrets / variables） |
| `supabase/supabase` | community | 1.10.1 | 2026-07-29 | **一部だけ**（下記） |
| `netlify/netlify` | partner | 0.4.4 | 2026-06-18 | 要確認（利用実績が少ない） |
| `koyeb/koyeb` | partner | 0.1.11 | **2024-12-12** | **実質できない**（1 年半以上更新なし・v0.1 系） |
| `fly-apps/fly` | partner | 0.0.23 | **2023-06-22** | **できない**（3 年以上更新なし・v0.0 系） |
| Hasura Cloud | — | — | — | **プロバイダが無い**（下記） |

## Hasura Cloud には使えるプロバイダが無い

Registry にある 2 つはいずれも**放置されている。**

| プロバイダ | 最新 | 最終公開 |
| :- | :- | :- |
| `AlexeyRaga/hasura` | 0.0.5 | **2021-09-07** |
| `hasuracommunity/hasura` | 0.0.7 | **2020-10-06** |

**Hasura Cloud を選ぶと、その部分は Terraform の管理外になる**（ダッシュボードでの手作業）。
これは #29 の選定に直接効くので、[decision.md](/project/plan/deploy/decision.md) のとおり
**評価軸として #29 に持ち込む。**

## Supabase プロバイダで**できないこと**

公開されている資源は 7 つだけである。

```text
project / settings / apikey / branch
edge_function / edge_function_secrets / third_party_auth
```

**DB のスキーマもマイグレーションも対象外。** これは欠陥ではなく役割分担で、
このリポジトリでは Prisma が正本なので**むしろ都合がよい。**
Terraform はプロジェクトと設定だけを持ち、テーブルには触らない。

なお **community 段階**（partner / official ではない）である点は、
採用時に #29 で明示しておく。

## Supabase の設定は Terraform で管理しない

> [!WARNING]
> **`supabase/config.toml` が既にホスト版プロジェクトの設定の正本である。**
> Terraform の `supabase_settings` を足すと、**同じ設定を 2 つの道具が奪い合う。**

`supabase/config.toml`（Discussion #70 / Issue #71 で導入）は
冒頭コメントで自らを「**ホスト版プロジェクトの認証設定を宣言する正本**」と定義しており、
`make supabase-push` → `supabase config push` で適用される。

二重管理は**実際に壊れる**。`config push` には **dry-run も diff も無い**ため、
Terraform が変えた値を次の push が既定値で上書きしても、**適用するまで気づけない。**
`Makefile` の `supabase-push` が警告している
「`[auth.hook.custom_access_token]` が無効化されると Hasura の行レベル権限が全件を弾く」が
まさにこの事故である。

| 対象 | 正本 |
| :- | :- |
| Supabase の認証設定（`site_url` / Hook / SMTP ほか） | **`supabase/config.toml`**（`supabase config push`） |
| DB のスキーマ | **Prisma** |
| Hasura のメタデータ | **`hasura/metadata/`**（`hasura metadata apply`） |
| Supabase プロジェクトそのものの存在 | Terraform に持たせるか**要判断**（既に手で作成済み） |

**プロジェクトは既に手作業で作成済み**（`project-ref` = `kdhyeuasgxdlkzwqfbij`）なので、
Terraform に取り込むなら `import` が要る。**取り込まない判断も妥当**で、その場合
Supabase は丸ごと Terraform の管理外になる。層 5 で決める。

# 秘匿値の置き場所

**Terraform の state には、変数に入れた秘匿値が平文で入る。**
`sensitive = true` は**画面表示を隠すだけ**で、state ファイルの中身は隠さない。

したがって次の 2 つは守る。

1. **state をコミットしない**（`.gitignore` 済みか層 5 で確認する）
2. **state をリモートに置く場合、その保管場所自体にアクセス制御が要る**

秘匿値の流し方は 2 通りあり、**どちらもリポジトリには置かない。**

| 方式 | 流れ | 向くもの |
| :- | :- | :- |
| CI の secret から `TF_VAR_*` で渡す | GitHub Actions secret → Terraform 変数 → プラットフォーム | Terraform が作る資源に必要な値 |
| プラットフォーム側に直接置く | ダッシュボード / CLI で設定 | Terraform が管理しない値（例: Supabase の SMTP パスワード） |

既に後者の前例がある。Resend の API キーは `.env.example` に**意図的に変数を置かず**、
Supabase のダッシュボードにだけ入れている（`.env.example` の該当節）。同じ判断基準を使う。

# state の置き場所（層 5 で決める）

**現在 state はローカルにしか無い**（`infra/` にバックエンド設定が無い）。
CI から `apply` するなら**リモート state が要る。** 無料で選べる形は 3 つ。

| 形 | 概要 | 確認が要る点 |
| :- | :- | :- |
| HCP Terraform（旧 Terraform Cloud） | HashiCorp のマネージド。ロックと履歴が付く | **無料枠の資源数上限**を要確認 |
| S3 互換ストレージ（Cloudflare R2 など） | `s3` バックエンドを S3 互換に向ける | ロックは Terraform 1.10 以降の `use_lockfile` を使う。**`required_version = ">= 1.0"` の引き上げが要る** |
| ローカルのまま | CI から `apply` しない。人間が手元で流す | 自動化を諦めることになる |

> [!NOTE]
> 上表の無料枠の条件は**未検証**である。[decision.md](/project/plan/deploy/decision.md) のとおり、
> 数値の正本は Discussion #29 に確認日付つきで記録する。

**Terraform 本体か OpenTofu かは、この計画では扱わない。**
ライセンスとレジストリの選択であり、必要なら**独立した Discussion**を立てる（AGENTS.md の「CI / IaC」は選定対象）。

# 既存の AWS コードをどうするか

[findings.md](/project/plan/deploy/findings.md) の 7 のとおり、`infra/main.tf` の
VPC / RDS は**この計画で作る環境と 1 つも重ならない。**

**削除は勧めない。** README の【目的】が求めているのは
「Terraform の**ローカル品質管理**（fmt, lint, plan, test）を実践する」であり、
`main.tftest.hcl` は `plan` に対するアサーションなので **apply しなくても価値が残る。**

## 提案するディレクトリ構成

```text
infra/
  aws/    ← 既存の main.tf / main.tftest.hcl をそのまま移す。apply しない（学習用）
  app/    ← 実際に apply する。#29 で決まったプロバイダを書く
```

移動に伴って直すもの:

- `.terraform-docs.yml` と `infra/README.md` の生成先（現在 `infra/` 直下の 1 つ）
- `Makefile` に Terraform のターゲットが**無い**ので、追加するならこの層で入れる

**この構成にするかは層 5 で決める。** ディレクトリを分けずに `main.tf` を置き換える案もあるが、
その場合は AWS の学習成果と `main.tftest.hcl` が消える。

## README の成功条件 5 と衝突する

**「AWS でサービスが稼働すること」は無料枠デプロイと両立しない。**
選択肢は 3 つあり、**どれを採るかは人間の判断**である。

| 案 | 内容 |
| :- | :- |
| A | 成功条件 5 を「無料枠のサービスで常設稼働すること」に**書き換える** |
| B | 5 を**未達のまま残す**。AWS は `plan` までの学習対象と位置づける |
| C | 一時的に AWS へ apply して確認し、**すぐ destroy** して 5 を満たす |

C は README の「おまけ」にある「AWS へデプロイ、GUI 上でリソースや設定の確認」に近い。
**課金は発生するが短時間なら小さい。** ただし RDS は作成・削除に時間がかかる点に注意。
