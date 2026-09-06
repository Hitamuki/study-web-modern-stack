# apps/web（React + Vite）の配信。静的アセットだけを返す Worker で、
# スクリプト本体は持たない（assets のみ）。
#
# アセットの中身はコミットのたびに変わるため、**日常の更新は CI が流す**。
# Terraform が持つのは箱の宣言（スクリプトの存在とカスタムドメイン）である。
# → project/plan/deploy/terraform-scope.md の判定基準 1
resource "cloudflare_workers_script" "web" {
  account_id  = var.cloudflare_account_id
  script_name = "sk8trickhub-web"

  assets = {
    directory = var.web_dist_path

    config = {
      # SPA なので、アセットに一致しないパスは index.html を 200 で返す。
      # 404 を返すとブラウザ側のルーティング（React Router）が働かない。
      not_found_handling = "single-page-application"
    }
  }

  observability = {
    enabled = true
  }
}

# カスタムドメインを付けると Cloudflare が DNS レコードと証明書を自動で作る。
# そのため apex 用の cloudflare_dns_record は書かない（二重管理になる）。
resource "cloudflare_workers_custom_domain" "web" {
  account_id = var.cloudflare_account_id
  zone_id    = var.cloudflare_zone_id
  hostname   = var.domain
  service    = cloudflare_workers_script.web.script_name
}
