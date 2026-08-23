---
type: Runbook
title: Resend を custom SMTP として設定する
description: Resend のドメイン検証と Supabase の SMTP 設定。ダッシュボードと DNS だけの作業で、リポジトリのコードは 1 行も変わらない。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/71
tags: [auth, resend, メール, 人間の作業, 手順書]
status: stable
stale_after: 2026-09-23
generated: { by: claude-code/claude-opus-5, at: 2026-08-23T00:00:00Z }
sources:
  - resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/70
    title: 認証メールの送信手段の選定（Resend に決着）
  - resource: https://resend.com/docs/send-with-smtp
    title: Resend SMTP の接続情報
    last_modified: 2026-08-23
  - resource: https://resend.com/docs/knowledge-base/403-error-resend-dev-domain
    title: resend.dev ドメインの制限
    last_modified: 2026-08-23
  - resource: https://supabase.com/docs/guides/auth/auth-smtp
    title: Supabase Auth SMTP
---

# これが済むまで第三者にメールが届かない

Supabase の組み込み送信は**組織メンバーのアドレス宛にしか届かず、上限は 2 通/時**です。
SCR-002（アカウント作成）と SCR-003（パスワードリセット申請）は、
**自分以外のユーザーが 1 人でも増えた時点で成立しなくなります。**

しくみの解説は [explain/email.md](/project/plan/auth/explain/email.md) にあります。

> [!WARNING]
> **ドメインが無いと 1 ミリも進みません。**
> Resend はドメインを検証するまで `onboarding@resend.dev` からしか送れず、
> **宛先も Resend アカウントの登録アドレスに限られます。**
> これは Supabase の組み込み送信と実質同じ制限で、乗り換えた意味がありません。
>
> ドメインはサービス名に依存するため、**Discussion
> [#46](https://github.com/Hitamuki/study-web-modern-stack/discussions/46)（サービス名の選定）が
> 未決着であることが唯一の律速**です。

# アプリのコードは変わらない

**メールを送るのは Supabase のサーバーで、`apps/api` でも `apps/web` でもありません。**

```text
apps/web ──resetPasswordForEmail()──▶ Supabase ──SMTP──▶ Resend ──▶ 受信者
                                        ▲
                              supabase/config.toml + .env
```

`apps/web` の呼び出しは配信経路を知りません。変えるのは
**[supabase/config.toml](/supabase/config.toml)（設定の正本）と DNS だけ**で、
`pnpm` の依存は増えません。

Supabase の設定は config.toml でコードとして管理し、`supabase config push` で適用します。
**API キーの値は config.toml に書かず、`.env` から `env(RESEND_API_KEY)` で参照します**
（[API キーの置き場所](#api-キーの置き場所)）。

# 手順

## 1. Resend に登録する

[resend.com](https://resend.com) でアカウントを作ります。無料枠は **3,000 通/月・100 通/日・1 ドメイン・データ保持 30 日**です。

> [!NOTE]
> **カード登録を求められるかは未確認です**（Discussion #70 で未確認のまま残した項目）。
> 実際どうだったかを Issue #71 の「まとめ」に記録してください。

## 2. ドメインを追加して DNS を設定する

Resend の Domains で送信ドメインを追加すると、登録すべき DNS レコードが表示されます。

| レコード | 役割 |
| :- | :- |
| **SPF**（TXT） | このドメインのメールを送ってよいサーバーを宣言する |
| **DKIM**（TXT） | 送信時に電子署名を付け、改ざんとなりすましを検出できるようにする |
| **DMARC**（TXT） | SPF / DKIM に失敗したメールをどう扱うかを受信側に指示する |

DNS に登録し、Resend 側の検証が **Verified** になるまで待ちます（反映に時間がかかることがあります）。

## 3. API キーを `.env` に置く

Resend の Dashboard → API Keys でキーを作り、**リポジトリ直下の `.env`** に書きます。

```bash
RESEND_API_KEY="re_xxxxxxxxxxxx"
```

`.gitignore` 済みでコミットされません。**`apps/api/.env` ではありません**
（NestJS はこの値を読みません。理由は [API キーの置き場所](#api-キーの置き場所)）。

## 4. `supabase/config.toml` を書き換える

`[auth.email.smtp]` を有効化し、`admin_email` を検証済みドメインのアドレスにします。
`#71:` 印のコメントが付いている箇所が対象です。

```diff
 [auth.email.smtp]
-enabled = false
+enabled = true
 host = "smtp.resend.com"
 port = 587
 user = "resend"
 pass = "env(RESEND_API_KEY)"
-admin_email = "noreply@example.com"
+admin_email = "noreply@<取得したドメイン>"
 sender_name = "study-web-modern-stack"
```

あわせてレート上限を上げます（custom SMTP 時の既定は 30 通/時）。

```diff
 [auth.rate_limit]
-email_sent = 2
+email_sent = 30
```

本番の URL が決まったら `additional_redirect_urls` にも追加します（Discussion #29 待ち）。

## 5. ホスト版プロジェクトへ適用する

**未 link の状態では push できません。** 先に link します。

```bash
supabase login                                   # 未ログインなら
supabase link --project-ref kdhyeuasgxdlkzwqfbij

set -a; source .env; set +a                      # env(RESEND_API_KEY) を解決させる
supabase config push
```

> [!WARNING]
> **`config push` に dry-run も diff もありません**（サブコマンドは `push` だけ）。
> **config.toml に書いていない設定は既定値として送られ、ダッシュボードでの手作業を上書きします。**
>
> 特に `[auth.hook.custom_access_token]` が無効化されると、JWT に `x-hasura-user-id` が
> 入らなくなり **Hasura の行レベル権限が全件を弾いて 0 件になります**。
> 「権限が壊れた」ように見えて実際は設計どおりの挙動なので、原因の切り分けに時間を溶かします。
> push 後は必ず [verify-hook.md](/project/plan/auth/manual/verify-hook.md) で確認してください。

`set -a; source .env; set +a` はシェルの環境変数として読み込ませる確実な方法です。
CLI が `.env` を自動で読む場合もありますが、**依存しないほうが安全**です。

## 6. メール本文のテンプレートは Supabase 側で管理する

**Authentication → Emails → Templates**（または config.toml の `[auth.email.template.*]`）を使います。
**Resend 側のテンプレート機能は使いません。**

理由は乗り換えコストです。Resend のテンプレートに寄せると、送信サービスを変えるときに作り直しになります
（Discussion #70 の反証条件 6）。SMTP 設定と DNS だけで差し替えられる状態を保ちます。

# 検証

**組織メンバー以外のアドレス**（Gmail など外部のプロバイダ）で確認します。
組織メンバー宛だと組み込み送信でも届くため、**差し替えられたことの確認になりません。**

1. SCR-002 でそのアドレスを使ってアカウントを作成し、確認メールが届く
2. SCR-003 でパスワードリセットを申請し、メールが届く
3. **迷惑メールフォルダに入っていない**ことを確認する（共有 IP のため。Discussion #70 の反証条件 3 の実測）
4. メール内のリンクから SCR-004 に着地し、パスワードを更新できる
5. 送信元が自分のドメインになっている（`onboarding@resend.dev` ではない）

届かないときは Resend の **Logs**（保持 30 日）で、送信されたのか受信側で弾かれたのかを切り分けます。

# API キーの置き場所

| 置く場所 | 置くか | 理由 |
| :- | :- | :- |
| **`.env`（リポジトリ直下）** | **置く** | `supabase config push` のときに CLI が読む |
| `supabase/config.toml` | **値は置かない** | Git にコミットされる。`env(RESEND_API_KEY)` で参照するだけ |
| `apps/api/.env` | 置かない | **NestJS はメールを送らず、読む処理が無い** |
| Terraform（`infra/`） | 置かない | Supabase の設定を Terraform で管理していない |

どちらの `.env` も `.gitignore` 済みで、実値の置き場所として正しく機能します。
`apps/api/.env` に置かないのは安全性の問題ではなく、**そこに読む主体がいない**からです。
使われない環境変数を増やすと「設定したのに動かない」の原因になります。

> [!NOTE]
> **Send Email Hook**（Discussion #70 の H2）に切り替えると、Supabase が `apps/api` を呼び
> **NestJS が Resend の API を直接叩く**形になります。そのときは `apps/api/.env` にも
> `RESEND_API_KEY` が必要になります。H2 に切り替えるなら #70 の決定を上書きせず、
> **新しい Discussion を立てます**（AGENTS.md「技術選定」）。

# 落とし穴

| 落とし穴 | 何が起きるか | 回避 |
| :- | :- | :- |
| ドメイン検証前に試す | 自分の登録アドレスにしか届かず、成功したと誤認する | 外部プロバイダのアドレスで確認する |
| 組織メンバーのアドレスで検証する | 組み込み送信でも届くため差し替えを検証できない | Gmail など外部のアドレスを使う |
| Username に自分のメールアドレスを入れる | 認証に失敗する | 固定文字列 `resend` を入れる |
| Resend のテンプレート機能を使う | 乗り換えが設定変更で済まなくなる | Supabase の Templates を使う |
| 迷惑メール判定を確認しない | 「届かない」の報告が後から出る | 受信トレイに入ることまで確認する |
| **Hook を宣言せず `config push`** | JWT の `x-hasura-user-id` が消え、**全クエリが 0 件**になる。権限バグに見える | config.toml の `[auth.hook.custom_access_token]` を有効のまま保ち、push 後に `verify-hook.md` で確認する |
| `env()` を解決せずに push | SMTP のパスワードが空で適用され、送信が全滅する | `set -a; source .env; set +a` を先に実行する |
| API キーを config.toml に直接書く | Git にコミットされて漏れる | `env(RESEND_API_KEY)` で参照し、値は `.env` に置く |

**次は [../verification.md](/project/plan/auth/verification.md) の通し検証です。**
