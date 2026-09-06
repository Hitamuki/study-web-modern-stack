---
type: Plan
title: Terraform で何を管理するか
description: 管理するサービスとしないサービスの切り分け。Discussion #29 の決着（2026-09-06）を反映。
resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/29
tags: [deploy, terraform, infra, iac]
status: draft
stale_after: 2026-10-06
generated: { by: claude-code/claude-opus-5, at: 2026-09-06T00:00:00Z }
---

# 前提: いったん全部消して、段階 3 で作り直す

**AWS を使う予定が無くなったため、`infra/` は段階 1（層 2）で削除する。**
→ [layer-remove-terraform.md](/project/plan/deploy/layer-remove-terraform.md)

**Terraform をやめるわけではない。** #29 で載せ先が決まったあと、
段階 3 でそのプラットフォーム向けに `infra/` を作り直す。
このファイルは**そのときの設計方針**である。

```text
段階 1  infra/ を削除          ← AWS 向けのコードは 1 資源も再利用しない
段階 2  デプロイ準備            ← Terraform は登場しない
段階 3  infra/ を作り直す       ← 下記の切り分けに従って書く
```

# 切り分けの判定基準

**「Terraform でインフラを管理する」を「全部 Terraform で書く」と読むと失敗する。**

判定は 2 つの問いで足りる。

| # | 問い | Yes なら |
| :- | :- | :- |
| 1 | **コミットのたびに変わるか** | **CI** の担当。Terraform に持たせない |
| 2 | **すでに別の正本があるか** | **その正本**の担当。Terraform に持たせない |

1 が「箱と中身」の線引きで、2 が「二重管理の禁止」である。
**どちらにも当たらないものだけを Terraform が持つ。**

## なぜ「毎回変わるもの」を持たせないのか

デプロイのたびに `terraform apply` を回すと、**アプリのバージョンが state に入る。**
state は履歴を持たないため、**誰がいつ何を出したかが追えなくなる。**
それは Git と CI のログの仕事である。

# 管理するもの・しないもの

**この表がこのファイルの結論である。** Discussion #29 の決着（2026-09-06）で対象が確定した。

## Terraform で管理する

| サービス | 何を宣言するか | プロバイダ |
| :- | :- | :- |
| **Cloudflare Workers**（Web の配信） | スクリプト、**静的アセットのアップロード**、カスタムドメイン | `cloudflare_workers_script`（`assets` ブロック）/ `cloudflare_workers_custom_domain` |
| **Cloudflare DNS** | ゾーンのレコード。**Resend の SPF / DKIM / DMARC を含む** | `cloudflare_dns_record` |
| **Render**（NestJS の実行環境） | Web Service の存在、環境変数の**キー** | `render_web_service` |
| **GitHub Actions の変数**（secret ではない値） | Terraform が作った資源の URL などを CI へ渡す | `integrations/github`（`github_actions_variable`） |
| **state の保管場所** | バケットとアクセス制御 | Terraform 自身の土台 |

### GitHub を Terraform に持たせる理由（と、持たせないもの）

**目的は「Terraform の出力を CI へ自動で渡すこと」である。** 権限管理ではない。

`terraform apply` で Worker と Render のサービスを作ると、**その URL は Terraform の出力として確定する。**
CI はその値を知る必要があるが、手でコピーして GitHub の画面に貼ると**構成変更のたびにずれる。**

```hcl
resource "github_actions_variable" "graphql_url" {
  variable_name = "VITE_GRAPHQL_URL"
  value         = "https://${hasura_endpoint}/v1/graphql"   # Terraform の出力から
}
```

**これが GitHub をスコープに入れる唯一の理由である。** 逆に言えば、
Terraform の出力に由来しない値を GitHub に持たせる必要はない。

> [!WARNING]
> **secret は Terraform で管理しない。** `github_actions_secret` は値を渡す必要があり、
> **その値が state に平文で入る**（下記「秘匿値の置き場所」）。
> 「Terraform に秘匿値を持たせない」という自分のルールと矛盾するため、
> **secret は `gh secret set` で人が設定する。**

| GitHub の対象 | 担当 |
| :- | :- |
| Actions の**変数**（URL など公開してよい値） | **Terraform**（出力から自動で埋まる） |
| Actions の **secret**（API トークン等） | **`gh secret set`**（人が設定） |
| ブランチ保護・リポジトリ設定 | **対象外。** 必要になったら別途判断する |

> [!NOTE]
> **`cloudflare_workers_script` の `assets` ブロックは静的ファイルのアップロードまで担える**
> （`assets.directory` / `not_found_handling = "single-page-application"`）。
> 「アセット配置は Wrangler 専用」ではない。ただし**毎コミット変わるのはアセットの中身**なので、
> 実際に流すのは CI にする（判定基準 1）。Terraform が持つのは**箱の宣言**である。

## Terraform で管理しない

| サービス | 正本 | なぜ持たせないか |
| :- | :- | :- |
| **Hasura Cloud** | ダッシュボード（手作業） | **プロバイダが存在しない。** 最終公開が 2021 年と 2020 年 |
| **Supabase** | `supabase/config.toml`（`supabase config push`） | **判定基準 2。** 下記のとおり事故る |
| **Resend** | Supabase のダッシュボード（SMTP 設定） | 公式プロバイダ無し。**DNS 側は Cloudflare で管理する** |
| **UptimeRobot** | ダッシュボード | 監視対象が 1 つ。IaC 化の費用対効果が無い |
| **Hasura のメタデータ** | `hasura/metadata/`（`hasura metadata apply`） | 判定基準 2 |
| **DB のスキーマ** | `apps/api/prisma/schema.prisma` | 判定基準 2（`hasura/README.md` の役割分担） |
| **ビルド成果物・デプロイ** | GitHub Actions | **判定基準 1** |
| **GitHub Actions の secret** | `gh secret set`（人が設定） | **値が state に平文で入る**（上記） |
| **秘匿値の中身** | CI の secret / 各サービスの設定画面 | **state に平文で入る**（下記） |

> [!WARNING]
> **Hasura Cloud が IaC の外に出るのは、この構成で受け入れた唯一の妥協である。**
> GraphQL エンジンという中核がダッシュボードでの手作業になり、再現性が無い。
> Discussion #29 の評価軸 7 で唯一の管理外項目として記録した。

## 正本の地図

段階 3 を終えた時点で、設定の正本は 5 つに分かれる。**重ねない。**

| 正本 | 守備範囲 | 適用コマンド |
| :- | :- | :- |
| `infra/`（Terraform） | Cloudflare / Render / GitHub の箱 | `terraform apply` |
| `supabase/config.toml` | Supabase の認証設定 | `make supabase-push` |
| `hasura/metadata/` | **Hasura の権限・Actions（認可の正本）** | `hasura metadata apply` |
| `apps/api/prisma/schema.prisma` | **テーブル定義（スキーマの正本）** | `prisma migrate` |
| `.github/workflows/` | ビルドとデプロイの手順 | push / merge |

## 採らなかった 2 つ（2026-09-06）

構成案にあったが、**既存の正本と衝突するため採らない。**

| 案 | 採らない理由 |
| :- | :- |
| **Supabase RLS で行レベル制御** | **Hasura 経由に既定で効かない。** 所有者・スーパーユーザーには適用されず、Supabase の RLS は PostgREST が `request.jwt.claims` を設定する前提。Hasura も Prisma もこの経路を使わない。有効化しても「素通り」になる。**認可は Hasura permissions に一本化** |
| **Supabase CLI でマイグレーション** | NestJS が Prisma Client を使うため、Prisma が `db pull` 専用に降格し**スキーマの正本が 2 つ**になる。Supabase CLI は `config.toml` 専用に留める |

# Supabase を Terraform で管理しない理由

> [!WARNING]
> **`supabase/config.toml` が既にホスト版プロジェクトの設定の正本である。**
> Terraform の `supabase_settings` を足すと、**同じ設定を 2 つの道具が奪い合う。**

`supabase/config.toml`（Discussion #70 / Issue #71 で導入）は
冒頭コメントで自らを「ホスト版プロジェクトの認証設定を宣言する正本」と定義しており、
`make supabase-push` → `supabase config push` で適用される。

二重管理は**実際に壊れる**。`config push` には **dry-run も diff も無い**ため、
Terraform が変えた値を次の push が既定値で上書きしても、**適用するまで気づけない。**
`Makefile` の `supabase-push` が警告している
「`[auth.hook.custom_access_token]` が無効化されると Hasura の行レベル権限が全件を弾く」が
まさにこの事故である。

**プロジェクトの存在そのもの**（`supabase_project`）だけは Terraform に持たせる余地があるが、
既に手作業で作成済み（`project-ref` = `kdhyeuasgxdlkzwqfbij`）なので `import` が要る。
**取り込まない判断を既定とする。** Supabase は丸ごと Terraform の管理外でよい。

# プロバイダの実態（確認日 2026-08-24）

**候補ごとに Terraform で書ける範囲がまったく違う。** Terraform Registry の API で確認した。
**#29 の選定を左右する**ので、決着前に更新が必要なら再確認する。

| プロバイダ | 種別 | 最新 | 最終公開 | デプロイ対象そのものを宣言できるか |
| :- | :- | :- | :- | :- |
| `cloudflare/cloudflare` | partner | 5.23.0 | 2026-08-05 | **できる**（`pages_project` / `workers_script` / `r2_bucket` / `dns_record`。全 257 資源） |
| `vercel/vercel` | partner | 5.12.0 | 2026-08-20 | **できる**（`project` / `deployment` / `project_domain` / `project_environment_variable`。全 52 資源） |
| `render-oss/render` | partner | 1.9.1 | 2026-07-22 | **できる**（`web_service` / `static_site` / `postgres` / `env_group`。全 17 資源） |
| `hashicorp/google` | official | 7.45.0 | 2026-08-18 | **できる**（`google_cloud_run_v2_service` ほか） |
| `integrations/github` | partner | 6.13.0 | 2026-07-08 | **できる**（Actions の secrets / variables） |
| `supabase/supabase` | community | 1.10.1 | 2026-07-29 | できるが**使わない**（上記のとおり） |
| `netlify/netlify` | partner | 0.4.4 | 2026-06-18 | 要確認（利用実績が少ない） |
| `koyeb/koyeb` | partner | 0.1.11 | **2024-12-12** | **実質できない**（更新が 1 年半以上止まっている・v0.1 系） |
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

# 秘匿値の置き場所

**Terraform の state には、変数に入れた秘匿値が平文で入る。**
`sensitive = true` は**画面表示を隠すだけ**で、state ファイルの中身は隠さない。

したがって次の 2 つは守る。

1. **state をコミットしない**
2. **state をリモートに置く場合、その保管場所自体にアクセス制御が要る**

秘匿値の流し方は 2 通りあり、**どちらもリポジトリには置かない。**

| 方式 | 流れ | 向くもの |
| :- | :- | :- |
| CI の secret から `TF_VAR_*` で渡す | GitHub Actions secret → Terraform 変数 → プラットフォーム | Terraform が作る資源に必要な値 |
| プラットフォーム側に直接置く | ダッシュボード / CLI で設定 | Terraform が管理しない値（例: Supabase の SMTP パスワード） |

**secret 自体の登録は `gh secret set` で行う。** Terraform で登録すると state に平文で残るため、
「state に秘匿値を入れない」という前提が崩れる。**Terraform は secret を読む側であって、作る側ではない。**

既に後者の前例がある。Resend の API キーは `.env.example` に**意図的に変数を置かず**、
Supabase のダッシュボードにだけ入れている（`.env.example` の該当節）。同じ判断基準を使う。

# state の置き場所（段階 3 で決める）

**削除前の `infra/` はローカル state だった**（バックエンド設定が無い）。
作り直すときに CI から `apply` するなら**リモート state が要る。** 無料で選べる形は 3 つ。

| 形 | 概要 | 確認が要る点 |
| :- | :- | :- |
| HCP Terraform（旧 Terraform Cloud） | HashiCorp のマネージド。ロックと履歴が付く | **無料枠の資源数上限**を要確認 |
| S3 互換ストレージ（Cloudflare R2 など） | `s3` バックエンドを S3 互換に向ける | ロックは Terraform 1.10 以降の `use_lockfile` を使う |
| ローカルのまま | CI から `apply` しない。人間が手元で流す | 自動化を諦めることになる |

> [!NOTE]
> 上表の無料枠の条件は**未検証**である。[decision.md](/project/plan/deploy/decision.md) のとおり、
> 数値の正本は Discussion #29 に確認日付つきで記録する。

**Terraform 本体か OpenTofu かは、この計画では扱わない。**
ライセンスとレジストリの選択であり、必要なら**独立した Discussion**を立てる（AGENTS.md の「CI / IaC」は選定対象）。
