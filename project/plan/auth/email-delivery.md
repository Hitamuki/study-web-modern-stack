---
type: Task
title: 認証メールの配信経路
description: Supabase の組み込み送信は組織メンバー宛・2 通/時のため、自分以外のユーザーが増えた時点で SCR-002 / SCR-003 が成立しなくなる。Resend の custom SMTP に差し替える。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/71
tags: [auth, supabase, resend, メール, ブロッカー]
status: stable
stale_after: 2026-09-23
generated: { by: claude-code/claude-fable-5, at: 2026-08-22T00:00:00Z }
updated: { by: claude-code/claude-opus-5, at: 2026-08-23T00:00:00Z }
sources:
  - resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/70
    title: 認証メールの送信手段の選定（Resend に決着）
  - resource: https://supabase.com/docs/guides/auth/auth-smtp
    title: Supabase Auth SMTP
  - resource: https://resend.com/docs/send-with-smtp
    title: Resend SMTP の接続情報
    last_modified: 2026-08-23
---

# 何が問題か

Supabase Auth の組み込みメール送信は **プロジェクトの組織メンバーのアドレスにしか届かず、上限は 2 通/時**。
Supabase 自身が本番用ではないと明記している。

そのため SCR-002（アカウント作成の確認メール）と SCR-003（パスワードリセット申請）は、
**自分以外のユーザーが 1 人でも増えた時点で成立しなくなる。**

しくみの解説は [explain/email.md](/project/plan/auth/explain/email.md)、
実際の手順は [manual/resend-smtp.md](/project/plan/auth/manual/resend-smtp.md)。

# 決まっていること

Discussion [#70](https://github.com/Hitamuki/study-web-modern-stack/discussions/70) で決着済み（2026-08-18）。

| 項目 | 決定 |
| :- | :- |
| 配信経路 | **H1: Supabase に custom SMTP を差す**（H2 Send Email Hook は採らない） |
| 送信サービス | **Resend**（無料枠 3,000 通/月・100 通/日・1 ドメイン・ログ保持 30 日） |
| テンプレート | **Supabase 側で管理**。Resend のテンプレート機能は使わない（反証条件 6） |
| From のドメイン | 独自ドメイン（**#46 の決着待ち**） |
| 設定の管理 | **`supabase/config.toml`（`supabase config push` で適用）。** API キーは `.env` の `RESEND_API_KEY` |

# アプリのコードは変わらない

**アプリのコードは 1 行も変わらない。** 変わるのは `supabase/config.toml` と DNS だけ。

```text
apps/web ──resetPasswordForEmail()──▶ Supabase ──SMTP──▶ Resend ──▶ 受信者
                                        ▲
                              ここに接続情報を入れる（リポジトリの外）
```

`apps/web` の呼び出しは配信経路を知らないため、**送信サービスを変えてもアプリは無変更**。
これが Discussion #70 が「乗り換えコストはサービスではなくドメインの側にある」と結論した根拠。

## 設定の正本と API キーの置き場所

Supabase の設定は [supabase/config.toml](/supabase/config.toml) で**コードとして管理**し、
`supabase config push` でホスト版プロジェクト（`kdhyeuasgxdlkzwqfbij`）へ適用する。

| 置く場所 | 何を置くか |
| :- | :- |
| `supabase/config.toml`（コミットされる） | SMTP のホスト・ポート・ユーザー名と `pass = "env(RESEND_API_KEY)"` |
| `.env`（リポジトリ直下・`.gitignore` 済み） | **`RESEND_API_KEY` の実値** |
| `apps/api/.env` | **置かない。** NestJS はメールを送らず、読む処理が無い |

`apps/api/.env` に置かないのは安全性の問題ではなく、**そこに読む主体がいない**から。
キーを読むのは `supabase` CLI（`config push` のとき）だけなので、CLI が動くリポジトリ直下の `.env` に置く。

> [!WARNING]
> **`config push` に dry-run も diff も無い。** config.toml に書いていない設定は既定値として送られ、
> ダッシュボードでの手作業を上書きする。特に `[auth.hook.custom_access_token]` が無効化されると
> **JWT に `x-hasura-user-id` が入らず行レベル権限が全件を弾く**（0 件になる）。

**Send Email Hook**（#70 の H2）に切り替える場合は、NestJS が Resend を直接叩くため
`apps/api/.env` にも `RESEND_API_KEY` が必要になる。切り替えるなら #70 の決定を上書きせず、
**新しい Discussion を立てる**（AGENTS.md「技術選定」）。

# この計画との関係

**層 5 は #71 を待たない。** 自分のアドレス宛なら組み込み送信で動作確認できるため、
[layer-web-auth.md](/project/plan/auth/layer-web-auth.md) の実装と検証は先に進められる（**完了済み**）。

**待つのは「第三者に届くこと」の確認だけ。** 詳細は Issue
[#71](https://github.com/Hitamuki/study-web-modern-stack/issues/71) が正本。

| やること | 依存 |
| :- | :- |
| SCR-002 / SCR-003 の実装 | 無し。層 5 で完了 |
| 自分のアドレス宛で通しの動作確認 | 無し。層 5 で完了 |
| **第三者のアドレス宛に届く状態にする** | **#71**（Resend の custom SMTP 化） |

# #71 の律速

**送信ドメインが無いと 1 ミリも進まない。** Resend はドメインを検証するまで
`onboarding@resend.dev` からしか送れず、宛先も Resend アカウントの登録アドレスに限られる。
これは Supabase の組み込み送信の制限と実質同じ。

ドメインはサービス名に依存するため、**Discussion
[#46](https://github.com/Hitamuki/study-web-modern-stack/discussions/46)（サービス名の選定）が
未決着であることが唯一の律速**になっている。

```text
Discussion #46（サービス名）← 未決着・唯一の律速
  └ ドメイン取得
     └ #71 Resend の custom SMTP 化 ← manual/resend-smtp.md
        └ 第三者へのメール到達確認（#70 の反証条件 2・3 の実測）
```

**サービスを Resend に決めたことで前倒しできる作業は無い。**

# 未検証のまま決着させた項目

#70 は「反証条件 2・3 を実測してから結論を出す」としていたが、**実測せずに決着させた**。

| 項目 | 状態 | どこで確認するか |
| :- | :- | :- |
| 反証条件 2（登録の可否・審査） | 未実施 | #71 の AC。カード登録の要否も併せて記録する |
| 反証条件 3（共有 IP での到達性） | **未実測**。ドメイン検証まで測れない | #71 の AC（迷惑メールに入らないこと） |

**問題が出た場合は #70 の決定を上書きせず、追記のうえ新しい Discussion を立てる。**

# 開発中の回避策

組み込み送信の 2 通/時が支障になる場合、Supabase CLI のローカル環境は Mailpit を
`localhost:54324` に立てて認証メールをキャプチャできる。

ただし Wiki の決定「**ローカル開発でもクラウドの同じプロジェクトを使う**」と衝突するため、
採用するならその決定の見直しが要る（Discussion #19 の Answer）。
