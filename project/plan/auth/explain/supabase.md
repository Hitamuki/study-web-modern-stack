---
type: Explainer
title: Supabase とはなにか
description: Supabase の全体像と、このプロジェクトで実際に使う機能。
resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/19
tags: [auth, supabase, 解説, 初学者向け]
status: stable
stale_after: 2026-09-23
generated: { by: claude-code/claude-fable-5, at: 2026-08-23T00:00:00Z }
---

# Supabase とは

**PostgreSQL を中心に、アプリに必要な部品を一式そろえたサービス**です。
「Firebase の PostgreSQL 版」と説明されることが多いです。

自分でサーバーを立てなくても、ブラウザから設定するだけで使い始められます。

## 何ができるか

| 機能 | 何をしてくれるか | 今回使うか |
| :- | :- | :- |
| **Auth** | ユーザー登録・ログイン・パスワード再設定 | **使う** |
| Database | PostgreSQL 本体 | 今は使わない（将来検討） |
| Storage | 画像やファイルの保管 | 使わない |
| Realtime | データ変更の通知 | 使わない |
| Edge Functions | サーバー側の処理 | 使わない |

**今回使うのは Auth だけ**です。データベースはローカルの Docker のものを使い続けます。

# なぜ Supabase を選んだか

候補は Auth0 / Clerk / Firebase / AWS Cognito など多数ありました。
決め手は**乗り換えコスト**です。

Supabase はパスワードを `auth.users` テーブルに bcrypt で保存しており、
**`pg_dump` で自分のものとして持ち出せます。** 他社に移りたくなったとき、
ユーザーにパスワードの再設定を頼まずに済みます。

多くのサービスはパスワードのハッシュを外に出してくれません。
比較の全体は [Discussion #19](https://github.com/Hitamuki/study-web-modern-stack/discussions/19) にあります。

# Auth で具体的に何を使うか

| 使うもの | 役割 |
| :- | :- |
| **メール + パスワード認証** | ログインの方式 |
| **JWT の発行** | ログインすると「通行証」を発行してくれる |
| **Custom Access Token Hook** | 通行証に**このアプリ専用の情報を書き足す**しくみ |
| **JWKS の公開** | 通行証が本物か検証するための鍵を公開してくれる |

Hook が重要です。Supabase が既定で発行する通行証には
「このユーザーは誰か」しか書かれていませんが、Hasura は
**「どの権限で動くか」も書いてほしい**ため、Hook で書き足します。

詳しくは [how-it-works.md](/project/plan/auth/explain/how-it-works.md) を参照してください。

# 無料枠

| 項目 | 無料枠 |
| :- | :- |
| 月間アクティブユーザー | 50,000 |
| プロジェクト数 | 2 |
| クレジットカード | 不要 |

> [!WARNING]
> **7 日間アクセスが無いとプロジェクトが一時停止し、90 日で完全に削除されます。**
> 学習用に置きっぱなしにする場合の注意点で、[Discussion #29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29) で扱います。
