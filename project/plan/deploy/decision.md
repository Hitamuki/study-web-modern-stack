---
type: Decision
title: Discussion #29 の決着内容
description: #29 で確定した載せ先と、追加した評価軸 7、採らなかった 2 案。
resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/29
tags: [deploy, 技術選定, ブロッカー]
status: stable
stale_after: 2026-10-06
generated: { by: claude-code/claude-opus-5, at: 2026-09-05T00:00:00Z }
---

# 決着した（2026-09-06）

Discussion [#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) は
**Answer が付いて決着した。** 選定の全文・比較・落選理由は **#29 の Answer が正本**である。
ここには計画を読むうえで必要な要約だけを置く。

## 確定した構成

| レイヤー | 採用 |
| :- | :- |
| 静的フロント | **Cloudflare Workers + Static Assets** |
| DNS | **Cloudflare DNS**（`sk8trickhub.com`） |
| GraphQL エンジン | **Hasura Cloud（v2 / Cloud Free）** |
| DB・認証 | **Supabase**（PostgreSQL + Auth） |
| API | **NestJS on Render Free**（Docker） |
| メール | **Resend**（Supabase の custom SMTP） |
| 監視 / Keep Warm | **UptimeRobot** |
| CI/CD | **GitHub Actions** |
| IaC | **Terraform**（Cloudflare / Render / GitHub のみ） |

## 評価軸 7 を追加した

提案していた「**Terraform で管理できるか**」を **#29 の評価軸 7 として追加**し、Answer に反映した。

**この軸で Fly.io と Koyeb が落選した。** プロバイダがそれぞれ 2023-06 / 2024-12 を最後に
更新されておらず、実質使えないためである。

**Hasura Cloud はこの軸で唯一の管理外項目**だが、評価軸 4（Hasura を動かせるか）と
2（休止しないこと）を優先して採用した。**受け入れた妥協として記録する。**

## 採らなかった 2 案（当初の構成案からの修正）

| 案 | 採らない理由 |
| :- | :- |
| **Supabase RLS で行レベル制御** | **Hasura 経由に既定で効かない。** 認可は Hasura permissions に一本化 |
| **Supabase CLI でマイグレーション** | Prisma と正本が二重になる。Supabase CLI は `config.toml` 専用 |

詳細は [terraform-scope.md](/project/plan/deploy/terraform-scope.md) の「採らなかった 2 つ」。

# 残った未検証項目

**#29 のコメントにあった 3 つのうち、2 つがそのまま残っている。**

- [ ] 通常のアクセスで Supabase の一時停止を回避できるか
- [ ] cron で定期 ping する回避策を前提としてよいか（**サービスの想定利用から外れた運用**）
- [x] 無料プロジェクト 2 つの上限 → **1 つで足りる**（認証と DB を同居させるため）

> [!IMPORTANT]
> **Render の Keep Warm（UptimeRobot）も同じ性質の運用である。**
> Supabase の定期 ping と**同じ判断**として扱う。片方だけ許容する理屈は立たない。
> → [phase-3.md](/project/plan/deploy/phase-3.md) の「残るリスク」

# 段階ごとの DoR

**#29 が決着したので、段階 3 の Issue も着手できる状態になった。**
層 1〜5 はもともと #29 に依存しない。
