---
type: Explainer
title: 技術要素の一覧
description: この計画で登場する技術と、それぞれの役割。
tags: [auth, 技術スタック, 解説, 初学者向け]
status: stable
stale_after: 2026-09-23
generated: { by: claude-code/claude-fable-5, at: 2026-08-23T00:00:00Z }
---

# 今回新しく入るもの

| 技術 | 役割 | 選定の経緯 |
| :- | :- | :- |
| **Supabase Auth** | ユーザー登録・ログイン・JWT の発行 | [Discussion #19](https://github.com/Hitamuki/study-web-modern-stack/discussions/19) |
| **React Router v7** | 画面の切り替えと URL の対応 | [Discussion #75](https://github.com/Hitamuki/study-web-modern-stack/discussions/75) |
| `@supabase/supabase-js` | ブラウザから Supabase を呼ぶライブラリ | — |

# もともとあるもの

| 技術 | 今回の関わり |
| :- | :- |
| **Hasura** | JWT を検証し、行レベル権限でデータを絞る。**認可の主役** |
| **NestJS** | 書き込み処理。共有シークレットと所有者チェックを追加 |
| **Prisma** | テーブル定義。`owner_id` 列を追加 |
| **PostgreSQL** | データの保管。ローカルは Docker、本番は Supabase の予定 |
| **Apollo Client** | GraphQL の通信。JWT を付けて送るように変更 |
| **React + Vite** | 画面。ログイン画面などを追加 |

# 用語

| 用語 | 意味 |
| :- | :- |
| **認証**（Authentication） | **誰か**を確かめること。ログイン |
| **認可**（Authorization） | **何をしてよいか**を決めること。権限 |
| **JWT** | 署名つきの通行証。中身は読めるが偽造できない |
| **クレーム** | JWT の中に書かれた 1 つ 1 つの情報 |
| **JWKS** | 署名を検証するための公開鍵が置いてある場所 |
| **非対称鍵** | 署名を作る鍵と検証する鍵が別。検証側は偽造できない |
| **bcrypt** | パスワードを元に戻せない形に変換する方式 |
| **行レベル権限** | 「この人はこの行だけ」という単位の権限 |
| **セッション変数** | Hasura が JWT から取り出して下流に渡す値 |

**認証と認可は別物**です。ログインできること（認証）と、
そのデータを触ってよいこと（認可）は分けて考えます。

# なぜ Hasura が認可の主役なのか

権限の条件が **SQL の `WHERE` 句として実行される**からです。
アプリ側のコードで絞り込みを書き忘れても、データベースが返しません。

アプリ側で絞り込む方式だと、書き忘れがそのまま情報漏洩になります。

# もっと詳しく

- Wiki [認証・認可](https://github.com/Hitamuki/study-web-modern-stack/wiki/Authentication-Authorization) — 一般論と本プロジェクトでの適用
- Wiki [GraphQL](https://github.com/Hitamuki/study-web-modern-stack/wiki/GraphQL) / [Data](https://github.com/Hitamuki/study-web-modern-stack/wiki/Data)
