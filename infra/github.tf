# Terraform の出力を CI へ渡すためだけに GitHub をスコープに入れている。
# 権限管理やリポジトリ設定は対象外。
# → project/plan/deploy/terraform-scope.md の「GitHub を Terraform に持たせる理由」
#
# secret は作らない。github_actions_secret は値を渡す必要があり、
# その値が state に平文で入るため。secret は gh secret set で人が登録する。

# Hasura が Actions のハンドラを呼ぶ先。Hasura サーバー側の環境変数として使う。
resource "github_actions_variable" "action_base_url" {
  repository    = var.github_repository
  variable_name = "ACTION_BASE_URL"
  value         = render_web_service.api.url
}

# apps/desktop がパスワード再設定でユーザーを誘導する先。
resource "github_actions_variable" "web_app_url" {
  repository    = var.github_repository
  variable_name = "VITE_WEB_APP_URL"
  value         = "https://${cloudflare_workers_custom_domain.web.hostname}"
}

# VITE_GRAPHQL_URL はここで作らない。値は Hasura Cloud のエンドポイントで、
# Hasura Cloud は Terraform の管理外（プロバイダが無い）のため出力に由来しない。
# 層 8（#102）で Hasura Cloud を作ったときに扱う。
