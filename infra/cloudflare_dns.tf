# Resend が認証メールを送るための DNS レコード（#71 / #98）。
# **すでに手作業で作成済み**なので import ブロックで取り込む。
# 新規作成にすると apply で重複し、認証メールが止まる。
#
# ID は Cloudflare の API（GET /zones/<zone>/dns_records）から取得した。

import {
  to = cloudflare_dns_record.resend_spf
  id = "${var.cloudflare_zone_id}/56d7be3161b324225b9ade0455bb8bb3"
}

resource "cloudflare_dns_record" "resend_spf" {
  zone_id = var.cloudflare_zone_id
  name    = "send.${var.domain}"
  type    = "TXT"
  ttl     = 3600
  content = "\"v=spf1 include:amazonses.com ~all\""
}

import {
  to = cloudflare_dns_record.resend_dkim
  id = "${var.cloudflare_zone_id}/318405c92c6159e5d8c7cf653d1e6c3b"
}

resource "cloudflare_dns_record" "resend_dkim" {
  zone_id = var.cloudflare_zone_id
  name    = "resend._domainkey.${var.domain}"
  type    = "TXT"
  ttl     = 3600
  content = "\"p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDEgL0oaJU/E3tZQWyxXg3hh1WUycxkw/CmKrQOyvHuF3+OpnW6Dss5peVZJTQMgY1aAiNlA+i01k0cnElEJiB4BePdkQI5CkVfRgiAMI0h2+lEDeX9MwZD6IrthOn8gBE6bAQdaUbbP6OhXh5YglKghOTBExZou9rVd4zHaofDwIDAQAB\""
}

import {
  to = cloudflare_dns_record.resend_mx
  id = "${var.cloudflare_zone_id}/63983b5136f9e845a3a3ebf34672ee0f"
}

resource "cloudflare_dns_record" "resend_mx" {
  zone_id  = var.cloudflare_zone_id
  name     = "send.${var.domain}"
  type     = "MX"
  ttl      = 3600
  priority = 10
  content  = "feedback-smtp.ap-northeast-1.amazonses.com"
}

import {
  to = cloudflare_dns_record.dmarc
  id = "${var.cloudflare_zone_id}/4d0f7f7c1d73323cbc65438be9f48858"
}

# ttl = 1 は Cloudflare の Auto。
resource "cloudflare_dns_record" "dmarc" {
  zone_id = var.cloudflare_zone_id
  name    = "_dmarc.${var.domain}"
  type    = "TXT"
  ttl     = 1
  content = "\"v=DMARC1; p=none; rua=mailto:d62bf672ec594bc18c0ca3d4f529fb66@dmarc-reports.cloudflare.net\""
}
