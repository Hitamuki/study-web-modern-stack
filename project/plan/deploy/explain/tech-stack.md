---
type: Explainer
title: 技術要素の一覧
description: この計画で登場する技術と、それぞれの役割。
tags: [deploy, 技術スタック, 解説, 初学者向け]
status: draft
stale_after: 2026-09-24
generated: { by: claude-code/claude-fable-5, at: 2026-08-24T00:00:00Z }
---

# 今回新しく入るもの

| 技術 | 役割 | 状態 |
| :- | :- | :- |
| **Docker（Dockerfile）** | `apps/api` を「どこでも動く箱」に詰める | **未着手**（Dockerfile が 1 つも無い） |
| **GitHub Actions** | ビルドとデプロイの自動化 | **未着手**（`.github/workflows` が無い） |
| **ホスティングサービス** | アプリを置く場所 | **未決定**（Discussion #29） |
| Terraform のプロバイダ | 選んだサービスを Terraform から操作する | #29 の決着後に決まる |
| Terraform のリモート state | 構成の記録を CI と共有する | 層 5 で決める |

# もともとあるもの

| 技術 | 今回の関わり |
| :- | :- |
| **Terraform** | AWS 向けの定義（`infra/main.tf`）はあるが**この計画では使わない**。行き先を作り直す |
| **Supabase** | 認証に加えて、**アプリの DB としても使う予定**（#19 の決定による拘束） |
| **Hasura** | **最大の論点。** 常時起動のコンテナをどこに置くか |
| **NestJS** | コンテナ化して載せる。`PORT` は既に環境変数対応済み |
| **Prisma** | DB スキーマの正本。本番へ流す経路を新しく作る |
| **React + Vite** | ビルド成果物（静的ファイル）を配る。**接続先はビルド時に埋め込む** |
| **Docker Compose** | ローカル開発用として**そのまま残る**。本番では使わない |

# 用語

| 用語 | 意味 |
| :- | :- |
| **デプロイ** | 作ったものを使える場所に置いて動かすこと |
| **ホスティング** | プログラムやファイルを置かせてくれるサービス |
| **コンテナ** | プログラムと必要なもの一式を詰めた箱。どこでも同じように動く |
| **イメージ** | コンテナの設計図。これを配って各所で箱にする |
| **レジストリ** | イメージの置き場所 |
| **静的ホスティング** | HTML / CSS / JS を置いて配るだけのサービス |
| **CI / CD** | コードの変更をきっかけに、検査や配置を自動で行うしくみ |
| **IaC** | 構成をコードで書いて管理するやり方。Terraform がその道具 |
| **state** | Terraform が「いまどうなっているか」を記録したファイル |
| **プロバイダ** | Terraform が各サービスを操作するためのプラグイン |
| **コールドスタート** | 眠っていたプログラムが起きるまでの待ち時間 |
| **無料枠** | 無料で使える範囲。上限と休止条件が付く |

# 「正本」が複数ある構成

**この構成の理解で一番大事な点です。** 設定の種類ごとに、
**それを決めているファイルが違います。**

| 決めているもの | 正本 | 反映するコマンド |
| :- | :- | :- |
| DB のテーブル定義 | `apps/api/prisma/schema.prisma` | `prisma db push` |
| Hasura の権限・Actions | `hasura/metadata/` | `hasura metadata apply` |
| Supabase の認証設定 | `supabase/config.toml` | `supabase config push` |
| インフラの構成 | `infra/**.tf` | `terraform apply` |

**この 4 つは territory を侵さないように保ちます。**
たとえば Terraform で Supabase の認証設定を書くと、`config.toml` と奪い合いになります。
→ [iac.md](/project/plan/deploy/explain/iac.md) の「落とし穴: 正本が 2 つになること」

# もっと詳しく

- Wiki [Infra](https://github.com/Hitamuki/study-web-modern-stack/wiki/Infra) — Terraform と AWS の現状
- Wiki [Data](https://github.com/Hitamuki/study-web-modern-stack/wiki/Data) — DB と Hasura
- Wiki [Tooling](https://github.com/Hitamuki/study-web-modern-stack/wiki/Tooling) — lint / 整形 / CI
- Discussion [#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) — ホスティング先の選定（**未決着**）
