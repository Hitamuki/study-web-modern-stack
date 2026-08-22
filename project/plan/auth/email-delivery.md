---
type: Task
title: 認証メールの配信経路
description: Supabase の組み込み送信は組織メンバー宛・2 通/時のため、自分以外のユーザーが増えた時点で SCR-002 / SCR-003 が成立しなくなる。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/71
tags: [auth, supabase, resend, メール, ブロッカー]
status: stable
stale_after: 2026-09-18
generated: { by: claude-code/claude-fable-5, at: 2026-08-22T00:00:00Z }
sources:
  - resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/70
    title: 認証メールの送信手段の選定（Resend に決着）
  - resource: https://supabase.com/docs/guides/auth/auth-smtp
    title: Supabase Auth SMTP
---

# 何が問題か

Supabase Auth の組み込みメール送信は **プロジェクトの組織メンバーのアドレスにしか届かず、上限は 2 通/時**。
Supabase 自身が本番用ではないと明記している。

そのため SCR-002（アカウント作成の確認メール）と SCR-003（パスワードリセット申請）は、
**自分以外のユーザーが 1 人でも増えた時点で成立しなくなる。**

# この計画との関係

**層 5 は #71 を待たない。** 自分のアドレス宛なら組み込み送信で動作確認できるため、
[layer-web-auth.md](/project/plan/auth/layer-web-auth.md) の実装と検証は先に進められる。

**待つのは「第三者に届くこと」の確認だけ。** 詳細は Issue
[#71](https://github.com/Hitamuki/study-web-modern-stack/issues/71) が正本。

| やること | 依存 |
| :- | :- |
| SCR-002 / SCR-003 の実装 | 無し。層 5 でやる |
| 自分のアドレス宛で通しの動作確認 | 無し。層 5 でやる |
| **第三者のアドレス宛に届く状態にする** | **#71**（Resend の custom SMTP 化） |

# #71 の律速

**送信ドメインが無いと 1 ミリも進まない。** Resend はドメインを検証するまで
`onboarding@resend.dev` からしか送れず、宛先も Resend アカウントの登録アドレスに限られる。
これは Supabase の組み込み送信の制限と実質同じ。

ドメインはサービス名に依存するため、**Discussion
[#46](https://github.com/Hitamuki/study-web-modern-stack/discussions/46)（サービス名の選定）が
未決着であることが唯一の律速**になっている。

```text
Discussion #46（サービス名）← 未決着
  └ ドメイン取得
     └ #71 Resend の custom SMTP 化
        └ 第三者へのメール到達確認
```

# 開発中の回避策

組み込み送信の 2 通/時が支障になる場合、Supabase CLI のローカル環境は Mailpit を
`localhost:54324` に立てて認証メールをキャプチャできる。

ただし Wiki の決定「**ローカル開発でもクラウドの同じプロジェクトを使う**」と衝突するため、
採用するならその決定の見直しが要る（Discussion #19 の Answer）。
