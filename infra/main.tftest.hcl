# plan の出力に対する検証。apply しないので課金は発生しない。
#
# 実行には Cloudflare / Render / GitHub の資格情報が要る（plan がプロバイダに問い合わせるため）。
#   make infra-test

# 無料枠を外れていないこと。README の【成功の定義】3 を守る。
run "free_plan_only" {
  command = plan

  assert {
    condition     = render_web_service.api.plan == "free"
    error_message = "Render のプランが free ではない。月額の請求が発生する"
  }
}

# Keep Warm の経路。UptimeRobot と Render のヘルスチェックが同じ /health を見る。
run "health_check_path" {
  command = plan

  assert {
    condition     = render_web_service.api.health_check_path == "/health"
    error_message = "health_check_path が /health ではない。#87 で追加したエンドポイントと食い違う"
  }
}

# Render は Dockerfile を直接読む。ビルドコンテキストがルートでないと
# pnpm Catalogs が解決できない（#87）。
run "docker_build_matches_apps_api" {
  command = plan

  assert {
    condition     = render_web_service.api.runtime_source.docker.dockerfile_path == "apps/api/Dockerfile"
    error_message = "dockerfile_path が apps/api/Dockerfile ではない"
  }

  assert {
    condition     = render_web_service.api.runtime_source.docker.context == "."
    error_message = "ビルドコンテキストがリポジトリのルートでない。pnpm Catalogs が解決できずビルドが落ちる"
  }
}

# SPA のフォールバック。404 を返すと React Router が働かない。
run "worker_serves_spa" {
  command = plan

  assert {
    condition     = cloudflare_workers_script.web.assets.config.not_found_handling == "single-page-application"
    error_message = "not_found_handling が single-page-application ではない。直リンクで 404 になる"
  }
}

# カスタムドメインが公開ドメインと一致していること。
run "custom_domain_matches" {
  command = plan

  assert {
    condition     = cloudflare_workers_custom_domain.web.hostname == var.domain
    error_message = "Worker のカスタムドメインが var.domain と一致しない"
  }

  assert {
    condition     = cloudflare_workers_custom_domain.web.service == cloudflare_workers_script.web.script_name
    error_message = "カスタムドメインが別の Worker を指している"
  }
}

# Terraform が持つのは変数だけで、secret は作らない。
run "actions_variables_from_outputs" {
  command = plan

  assert {
    condition     = github_actions_variable.action_base_url.variable_name == "ACTION_BASE_URL"
    error_message = "Hasura Actions のハンドラ URL を渡す変数名が違う"
  }

  assert {
    condition     = github_actions_variable.web_app_url.value == "https://${var.domain}"
    error_message = "VITE_WEB_APP_URL が公開ドメインと一致しない"
  }
}

# Resend のメール用レコードは既存を取り込む。新規作成にすると認証メールが止まる。
run "resend_dns_unchanged" {
  command = plan

  assert {
    condition     = cloudflare_dns_record.resend_spf.content == "\"v=spf1 include:amazonses.com ~all\""
    error_message = "SPF の内容が Resend の指定と違う"
  }

  assert {
    condition     = cloudflare_dns_record.resend_mx.priority == 10
    error_message = "MX の優先度が 10 ではない"
  }
}

# 有料プランを弾く検証が効いていること。
run "paid_plan_rejected" {
  command = plan

  variables {
    render_plan = "starter"
  }

  expect_failures = [
    var.render_plan,
  ]
}
