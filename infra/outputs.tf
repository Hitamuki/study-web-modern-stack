output "web_url" {
  description = "Web（Cloudflare Workers）の公開 URL"
  value       = "https://${cloudflare_workers_custom_domain.web.hostname}"
}

output "api_url" {
  description = "API（Render）の公開 URL。Hasura Actions の ACTION_BASE_URL になる"
  value       = render_web_service.api.url
}

output "worker_script_name" {
  description = "CI がアセットを流し込む対象の Worker 名"
  value       = cloudflare_workers_script.web.script_name
}

output "render_service_id" {
  description = "Render のサービス ID。デプロイを CI から叩くときに使う"
  value       = render_web_service.api.id
}
