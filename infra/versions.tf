terraform {
  required_version = ">= 1.10"

  # state はローカルに置く（暫定 / 2026-09-06 の判断）。
  # backend ブロックを書かないとローカル state になる。CI から apply は流さない。
  # → project/plan/deploy/terraform-scope.md の「state の置き場所」

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.24"
    }
    render = {
      source  = "render-oss/render"
      version = "~> 1.9"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.13"
    }
  }
}
