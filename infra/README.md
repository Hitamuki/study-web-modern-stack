# infra

無料枠のサービス構成を Terraform で管理します（[#100](https://github.com/Hitamuki/study-web-modern-stack/issues/100)）。

**管理するのは Cloudflare / Render / GitHub の 3 つだけ**です。切り分けの正本は
[project/plan/deploy/terraform-scope.md](../project/plan/deploy/terraform-scope.md) にあります。

| 管理する | 管理しない（正本） |
| :- | :- |
| Cloudflare Workers（スクリプト・静的アセット・カスタムドメイン） | Hasura Cloud（**プロバイダが無い**） |
| Cloudflare DNS（Resend の SPF / DKIM / DMARC / MX） | Supabase（`supabase/config.toml`） |
| Render の Web Service | Hasura のメタデータ（`hasura/metadata/`） |
| GitHub Actions の**変数** | DB スキーマ（`apps/api/prisma/schema.prisma`） |
| | GitHub Actions の **secret**（`gh secret set`） |

## state はローカルです

`backend` ブロックを書いていないため、state は `infra/terraform.tfstate` に置かれます（`.gitignore` 済み）。
**CI から `apply` は流しません**（暫定 / 2026-09-06 の判断）。

> [!WARNING]
> **state には秘匿値が平文で入ります。** `sensitive = true` は画面表示を隠すだけです。
> `terraform.tfstate` を絶対にコミットしないでください。

## 使い方

資格情報は `.env` から `TF_VAR_*` として渡します。値は**リポジトリに置きません**。

```bash
make infra-plan    # init + validate + plan
make infra-test    # terraform test（plan ベース。apply しないので課金なし）
make infra-docs    # このファイルの下半分を再生成
```

`apply` は Makefile に入れていません。実サービスが作られるため、意図して手で打つ形にしています。

```bash
cd infra && terraform apply
```

### 前提

- **`apps/web` をビルドしておくこと。** `assets.directory` が `../apps/web/dist` を読みます
- `.env` に `CLOUDFLARE_API_TOKEN` と `RENDER_API_KEY` があること
- `gh auth status` が通っていること（GitHub の token に `gh auth token` を使います）

## Resend の DNS レコードは import します

`send.` の SPF / MX、`resend._domainkey.` の DKIM、`_dmarc.` の DMARC は
**#71 / #98 で手作業により作成済み**です。`import` ブロックで取り込むため、
`plan` では「import」として出ます。

> [!IMPORTANT]
> **新規作成にしないでください。** 重複したレコードができると認証メールが止まります。
> `plan` の結果が `0 to change` であることを確認してから `apply` してください。

## 有料プランは弾きます

`var.render_plan` に `free` 以外を入れると `validation` で失敗します。
README の【成功の定義】3「月額の請求が発生しないこと」を型で守るためです。
変更するときは Discussion を立ててください。

<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.10 |
| <a name="requirement_cloudflare"></a> [cloudflare](#requirement\_cloudflare) | ~> 5.24 |
| <a name="requirement_github"></a> [github](#requirement\_github) | ~> 6.13 |
| <a name="requirement_render"></a> [render](#requirement\_render) | ~> 1.9 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_cloudflare"></a> [cloudflare](#provider\_cloudflare) | 5.24.0 |
| <a name="provider_github"></a> [github](#provider\_github) | 6.13.0 |
| <a name="provider_render"></a> [render](#provider\_render) | 1.9.1 |

## Resources

| Name | Type |
|------|------|
| [cloudflare_dns_record.dmarc](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/dns_record) | resource |
| [cloudflare_dns_record.resend_dkim](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/dns_record) | resource |
| [cloudflare_dns_record.resend_mx](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/dns_record) | resource |
| [cloudflare_dns_record.resend_spf](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/dns_record) | resource |
| [cloudflare_workers_custom_domain.web](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/workers_custom_domain) | resource |
| [cloudflare_workers_script.web](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/workers_script) | resource |
| [github_actions_variable.action_base_url](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/actions_variable) | resource |
| [github_actions_variable.web_app_url](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/actions_variable) | resource |
| [render_web_service.api](https://registry.terraform.io/providers/render-oss/render/latest/docs/resources/web_service) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_cloudflare_account_id"></a> [cloudflare\_account\_id](#input\_cloudflare\_account\_id) | Cloudflare のアカウント ID | `string` | `"e0920c04925425b72c5289b7c3777262"` | no |
| <a name="input_cloudflare_api_token"></a> [cloudflare\_api\_token](#input\_cloudflare\_api\_token) | Cloudflare の API トークン。Workers Scripts:Edit（Account）と DNS:Edit / Zone:Read / Workers Routes:Edit（Zone）が要る。TF\_VAR\_cloudflare\_api\_token で渡す | `string` | n/a | yes |
| <a name="input_cloudflare_zone_id"></a> [cloudflare\_zone\_id](#input\_cloudflare\_zone\_id) | sk8trickhub.com のゾーン ID | `string` | `"a0ae25a2c2e44868e5038bc7b3dfe832"` | no |
| <a name="input_domain"></a> [domain](#input\_domain) | 公開ドメイン | `string` | `"sk8trickhub.com"` | no |
| <a name="input_github_owner"></a> [github\_owner](#input\_github\_owner) | GitHub のオーナー | `string` | `"Hitamuki"` | no |
| <a name="input_github_repository"></a> [github\_repository](#input\_github\_repository) | GitHub のリポジトリ名 | `string` | `"study-web-modern-stack"` | no |
| <a name="input_github_token"></a> [github\_token](#input\_github\_token) | GitHub の PAT。Actions の変数を書き込むために使う。TF\_VAR\_github\_token で渡す（gh auth token の値でよい） | `string` | n/a | yes |
| <a name="input_render_api_key"></a> [render\_api\_key](#input\_render\_api\_key) | Render の API キー。権限スコープの設定は無くアカウント全体に効く。TF\_VAR\_render\_api\_key で渡す | `string` | n/a | yes |
| <a name="input_render_owner_id"></a> [render\_owner\_id](#input\_render\_owner\_id) | Render のワークスペース ID（tea- から始まる） | `string` | `"tea-d3f4k11r0fns73d8atlg"` | no |
| <a name="input_render_plan"></a> [render\_plan](#input\_render\_plan) | Render のプラン。無料枠は starter ではなく free | `string` | `"free"` | no |
| <a name="input_render_region"></a> [render\_region](#input\_render\_region) | Render のリージョン。日本からの距離で singapore を選んでいる | `string` | `"singapore"` | no |
| <a name="input_web_dist_path"></a> [web\_dist\_path](#input\_web\_dist\_path) | Cloudflare Workers へ載せる静的アセットのディレクトリ。plan の前に apps/web のビルドが要る | `string` | `"../apps/web/dist"` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_api_url"></a> [api\_url](#output\_api\_url) | API（Render）の公開 URL。Hasura Actions の ACTION\_BASE\_URL になる |
| <a name="output_render_service_id"></a> [render\_service\_id](#output\_render\_service\_id) | Render のサービス ID。デプロイを CI から叩くときに使う |
| <a name="output_web_url"></a> [web\_url](#output\_web\_url) | Web（Cloudflare Workers）の公開 URL |
| <a name="output_worker_script_name"></a> [worker\_script\_name](#output\_worker\_script\_name) | CI がアセットを流し込む対象の Worker 名 |
<!-- END_TF_DOCS -->
