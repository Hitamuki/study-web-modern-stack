variable "cloudflare_api_token" {
  description = "Cloudflare の API トークン。Workers Scripts:Edit（Account）と DNS:Edit / Zone:Read / Workers Routes:Edit（Zone）が要る。TF_VAR_cloudflare_api_token で渡す"
  type        = string
  sensitive   = true
}

# アカウント ID / ゾーン ID / ワークスペース ID は秘匿値ではない。
# Worker の URL や wrangler の設定にそのまま出る種類の識別子なので、既定値として持つ。
# 秘匿値は API トークンだけで、そちらは TF_VAR_* で渡す。
variable "cloudflare_account_id" {
  description = "Cloudflare のアカウント ID"
  type        = string
  default     = "e0920c04925425b72c5289b7c3777262"
}

variable "cloudflare_zone_id" {
  description = "sk8trickhub.com のゾーン ID"
  type        = string
  default     = "a0ae25a2c2e44868e5038bc7b3dfe832"
}

variable "render_api_key" {
  description = "Render の API キー。権限スコープの設定は無くアカウント全体に効く。TF_VAR_render_api_key で渡す"
  type        = string
  sensitive   = true
}

variable "render_owner_id" {
  description = "Render のワークスペース ID（tea- から始まる）"
  type        = string
  default     = "tea-d3f4k11r0fns73d8atlg"
}

variable "github_token" {
  description = "GitHub の PAT。Actions の変数を書き込むために使う。TF_VAR_github_token で渡す（gh auth token の値でよい）"
  type        = string
  sensitive   = true
}

variable "domain" {
  description = "公開ドメイン"
  type        = string
  default     = "sk8trickhub.com"
}

variable "github_owner" {
  description = "GitHub のオーナー"
  type        = string
  default     = "Hitamuki"
}

variable "github_repository" {
  description = "GitHub のリポジトリ名"
  type        = string
  default     = "study-web-modern-stack"
}

variable "web_dist_path" {
  description = "Cloudflare Workers へ載せる静的アセットのディレクトリ。plan の前に apps/web のビルドが要る"
  type        = string
  default     = "../apps/web/dist"
}

variable "render_region" {
  description = "Render のリージョン。日本からの距離で singapore を選んでいる"
  type        = string
  default     = "singapore"
}

variable "render_plan" {
  description = "Render のプラン。無料枠は starter ではなく free"
  type        = string
  default     = "free"

  # README の【成功の定義】3「月額の請求が発生しないこと」を型で守る。
  # 有料プランに変えるときは、この検証を外す判断ごと記録に残す。
  validation {
    condition     = var.render_plan == "free"
    error_message = "月額の請求が発生しないことが成功の定義（README）なので free 以外は許可しない。変更するなら Discussion を立てる。"
  }
}
