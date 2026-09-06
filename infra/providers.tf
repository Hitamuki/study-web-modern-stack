provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "render" {
  api_key  = var.render_api_key
  owner_id = var.render_owner_id
}

provider "github" {
  token = var.github_token
  owner = var.github_owner
}
