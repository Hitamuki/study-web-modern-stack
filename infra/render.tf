# apps/api（NestJS）の実行環境。Render が Dockerfile を直接読む。
#
# 稼働時間は月 750 インスタンス時間 / ワークスペース。24 時間起こし続けると
# 31 日で 744 時間になるため、**このワークスペースに無料サービスを 2 つ置けない**。
# → project/plan/deploy/phase-3.md の「Keep Warm の方式」
resource "render_web_service" "api" {
  name   = "sk8trickhub-api"
  plan   = var.render_plan
  region = var.render_region

  runtime_source = {
    docker = {
      repo_url        = "https://github.com/${var.github_owner}/${var.github_repository}"
      branch          = "main"
      dockerfile_path = "apps/api/Dockerfile"
      # ビルドコンテキストはリポジトリのルート。pnpm Catalogs が
      # ルートの pnpm-lock.yaml 経由でしか解決できないため（#87）。
      context = "."
    }
  }

  # UptimeRobot が叩くのと同じエンドポイント。Render 自身のヘルスチェックにも使う。
  health_check_path = "/health"

  # env_vars はここで宣言しない。DATABASE_URL と HASURA_ACTION_SECRET は秘匿値で、
  # Terraform に持たせると state に平文で入る。Render のダッシュボードで設定する。
  # → project/plan/deploy/terraform-scope.md の「秘匿値の置き場所」
}
