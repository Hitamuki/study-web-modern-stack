---
type: Runbook
title: Resend を custom SMTP として設定する
description: 認証メールを第三者に届く状態にする手順。ダッシュボードと DNS の作業が中心で、アプリのコードは 1 行も変わらない。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/71
tags: [auth, resend, メール, 人間の作業, 手順書, 完了済み]
status: stable
stale_after: 2026-10-06
generated: { by: claude-code/claude-opus-5, at: 2026-08-23T00:00:00Z }
updated: { by: claude-code/claude-opus-5, at: 2026-09-06T00:00:00Z }
sources:
  - resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/70
    title: 認証メールの送信手段の選定（Resend に決着）
  - resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/46
    title: サービス名の選定（SK8TrickHub / ドメインの決定）
  - resource: https://resend.com/docs/send-with-smtp
    title: Resend SMTP の接続情報
    last_modified: 2026-08-23
  - resource: https://supabase.com/docs/guides/auth/auth-smtp
    title: Supabase Auth SMTP
---

> [!NOTE]
> **2026-09-06 に実施済みです。** 第三者のアドレス宛に**受信トレイ**で到達することを確認しました。
> 実施結果は Issue [#71](https://github.com/Hitamuki/study-web-modern-stack/issues/71) の「まとめ」を参照してください。
> このファイルは**再構築が必要になったとき**（ドメイン変更・プロジェクト作り直しなど）の手順書として残します。

# なぜ必要か

Supabase の組み込み送信は**組織メンバーのアドレス宛にしか届かず、上限は 2 通/時**です。
自分以外のユーザーが 1 人でも増えた時点で、SCR-002（アカウント作成）と SCR-003（パスワードリセット）が成立しなくなります。

しくみの解説は [explain/email.md](/project/plan/auth/explain/email.md) にあります。

# 前提

| 必要なもの | 理由 |
| :- | :- |
| **送信ドメイン**（このプロジェクトでは `sk8trickhub.com`） | Resend はドメインを検証するまで `onboarding@resend.dev` からしか送れず、**宛先も Resend アカウントの登録アドレスに限られる**。組み込み送信と同じ制限になる |
| Cloudflare（DNS を管理するアカウント） | SPF / DKIM / DMARC のレコードを置く |
| Supabase の DB パスワード | `supabase link` で聞かれることがある |
| **テスト用のメールアドレス**（自分の常用アドレス以外） | 検証で使う。自分のアドレスは元々届くため検証にならない |

# アプリのコードは変わらない

**メールを送るのは Supabase のサーバーで、`apps/api` でも `apps/web` でもありません。**

```text
apps/web ──resetPasswordForEmail()──▶ Supabase ──SMTP──▶ Resend ──▶ 受信者
                                        ▲
                              supabase/config.toml + .env
```

変えるのは [supabase/config.toml](/supabase/config.toml)（設定の正本）と DNS だけで、`pnpm` の依存は増えません。

# 担当の分かれ目

| 記号 | 意味 |
| :- | :- |
| 🙋 | **人間の作業。** ブラウザでのログイン・購入・目視確認が要るため代行できない |
| 🤖 | **エージェントが代行できる。** |

# 手順

## 🙋 1. Resend にドメインを登録する

1. [resend.com](https://resend.com) の **Domains → Add Domain** で送信ドメインを追加する
2. リージョンは配信先に近いものを選ぶ（国内向けなら **東京 / ap-northeast-1**）
3. 表示される DNS レコード（通常 3 件）を控える

| 種類 | 名前 | 用途 |
| :- | :- | :- |
| TXT | `resend._domainkey` | **DKIM**（電子署名。200 文字前後の公開鍵） |
| TXT | `send` | **SPF**（`v=spf1 include:amazonses.com ~all`） |
| MX | `send` | バウンス（不達通知）の受け取り。**Priority `10`** |

## 🙋 2. Cloudflare に DNS レコードを追加する

**DNS → Records → Add record** で 1 件ずつ追加します。

| 欄 | 意味 |
| :- | :- |
| **Name** | ドメインのどの部分に付けるか。**ドメイン名は自動で付くので書かない**（`resend._domainkey` と入力する） |
| **Content** | 値そのもの |
| **Priority**（MX のみ） | `10` |
| **TTL** | `Auto` でよい |

> [!WARNING]
> **DKIM が最も失敗しやすい箇所です。** 200 文字前後あるため、コピー時に改行や空白が混ざります。
> 貼り付け後に**先頭が `p=M`、末尾が `DAQAB`** になっているか目視してください。

- **値を引用符 `"` で囲まない。** Cloudflare では不要で、付けると値の一部になり検証に失敗する
- SPF の MX と TXT は**どちらも Name が `send`**。種類が違うので共存する（正常）
- Proxy status は TXT・MX には出ない。気にしなくてよい

## 🙋 3. DMARC を設定する

**Cloudflare の `Email → DMARC Management`** を使うのが簡単です。有効化すると `_dmarc` レコードが自動で作られ、
**レポートを Cloudflare が受信・解析してダッシュボードに表示**します。

> [!TIP]
> **DMARC レポートは機械可読の XML** です。メールに転送しても人間には読めません。
> Cloudflare に解析させるほうが実用的で、`dmarc@` 宛のメール転送を用意する必要もありません。

**必ず `p=none`（監視モード）から始めてください。** いきなり厳しくすると正規のメールまで弾かれます。
レポートで問題がないと確認できてから `p=quarantine` → `p=reject` と段階的に上げます。

> [!NOTE]
> **DMARC は Resend の必須項目ではありません**（recommended 扱い）。無くても手順 5 の検証は通ります。

## 🤖 4. 反映を確認する

```bash
dig +short TXT resend._domainkey.sk8trickhub.com
dig +short TXT send.sk8trickhub.com
dig +short MX  send.sk8trickhub.com
dig +short TXT _dmarc.sk8trickhub.com
```

**Resend の Verify を押す前にこれを通してください。** 失敗してから原因を探すより速く、
DKIM の欠落や空白の混入をその場で見つけられます。空で返る場合は反映待ちです（数分）。

## 🙋 5. Resend で Verify する

**Domains → 対象ドメイン → Verify DNS Records。** すべて Verified になるまでメールは送れません。

### Resend 側の設定で注意する点

> [!WARNING]
> **トラッキング指標（クリック / 開封の追跡）は有効にしないでください。**
> リンクを Resend 経由に書き換える仕組みのため、**パスワード再設定のリンクが別ドメインに書き換わり**、
> ユーザーからは不審に見えます。フィッシング判定・迷惑メール判定のリスクが上がります。

> [!NOTE]
> **TLS は既定で「日和見主義的（Opportunistic）」**です。受信サーバーが TLS 非対応なら平文で送ります。
> 認証メールには再設定トークンが入るため本来は「強制」が望ましいものの、
> 強制にすると TLS 非対応の宛先に**届かなくなります**。
> **まず到達性を確認し、そのあとで強制へ切り替える**のが安全な順序です。

## 🙋 6. API キーを `.env` に置き、Supabase に link する

Resend の **API Keys** でキーを作り、**リポジトリ直下の `.env`** に書きます。

```bash
RESEND_API_KEY="re_xxxxxxxxxxxx"
```

`.gitignore` 済みでコミットされません。**`apps/api/.env` ではありません**（[API キーの置き場所](#api-キーの置き場所)）。

続けて Supabase CLI にログインし、プロジェクトへ紐づけます。**ブラウザ認証が要るため代行できません。**

```bash
supabase login
supabase link --project-ref <SUPABASE_PROJECT_REF>
cat supabase/.temp/project-ref   # ref が表示されれば成功
```

> [!NOTE]
> `config push` は DB パスワードを使わないため、`link` で聞かれずに終わることがあります。**正常です。**

## 🤖 7. `supabase/config.toml` を書き換えて適用する

```diff
 [auth.email.smtp]
-enabled = false
+enabled = true
 host = "smtp.resend.com"
 port = 587
 user = "resend"
 pass = "env(RESEND_API_KEY)"
-admin_email = "noreply@example.com"
+admin_email = "noreply@<検証済みドメイン>"
 sender_name = "SK8TrickHub"

 [auth.rate_limit]
-email_sent = 2
+email_sent = 30
```

```bash
make supabase-push
```

> [!WARNING]
> **`config push` に dry-run も diff もありません**（サブコマンドは `push` だけ）。
> **config.toml に書いていない設定は既定値として送られ、ダッシュボードでの手作業を上書きします。**
>
> 特に `[auth.hook.custom_access_token]` が無効化されると、JWT に `x-hasura-user-id` が
> 入らなくなり **Hasura の行レベル権限が全件を弾いて 0 件になります**。
> 「権限が壊れた」ように見えて実際は設計どおりの挙動なので、切り分けに時間を溶かします。

## 🤖 8. Hook が生きているか確認する

**push のたびに必ず実行してください。** 手順は [verify-hook.md](/project/plan/auth/manual/verify-hook.md) です。
JWT のクレームに `x-hasura-user-id` が入っていれば正常です。

## 🙋 9. 到達性を確認する

> [!IMPORTANT]
> **手順 7 の適用が済んでから実施してください。**
> 適用前に試すと、まだ組み込み送信のままなので**第三者のアドレスには届きません**。
> 「設定したのに届かない」の原因が分からなくなります（2026-09-06 に実際にこれで詰まりました）。

**自分の常用アドレス以外**で確認します。自分のアドレスは元々届くため、切り替えの検証になりません。

1. SCR-002（アカウント作成）を**新しいアドレス**で実行し、確認メールが届くか
2. **受信トレイか迷惑メールか**を必ず両方確認する
3. SCR-003（パスワードリセット申請）も同じアドレスで実行
4. メール内のリンクから SCR-004 に着地できるか
5. 差出人が `SK8TrickHub <noreply@<ドメイン>>` になっているか

**同じアドレスで再試行しても確認メールは飛びません**（すでに登録済みのため）。毎回新しいアドレスを使うか、Gmail の `+` エイリアスを使います。

届かないときは Resend の **Emails** タブ（Logs ではない）で送信記録を見ます。

# API キーの置き場所

| 置く場所 | 置くか | 理由 |
| :- | :- | :- |
| **`.env`（リポジトリ直下）** | **置く** | `supabase config push` のときに CLI が読む |
| `supabase/config.toml` | **値は置かない** | Git にコミットされる。`env(RESEND_API_KEY)` で参照するだけ |
| `apps/api/.env` | 置かない | **NestJS はメールを送らず、読む処理が無い** |

どちらの `.env` も `.gitignore` 済みで、実値の置き場所として正しく機能します。
`apps/api/.env` に置かないのは安全性の問題ではなく、**そこに読む主体がいない**からです。
使われない環境変数を増やすと「設定したのに動かない」の原因になります。

> [!NOTE]
> **Send Email Hook**（Discussion #70 の H2）に切り替えると、Supabase が `apps/api` を呼び
> **NestJS が Resend の API を直接叩く**形になります。そのときは `apps/api/.env` にも
> `RESEND_API_KEY` が必要になります。切り替えるなら #70 の決定を上書きせず、
> **新しい Discussion を立てます**（AGENTS.md「技術選定」）。

# 落とし穴

実際に踏んだもの（2026-09-06）を含みます。

| 落とし穴 | 何が起きるか | 回避 |
| :- | :- | :- |
| **SMTP を有効化する前に到達性を試す** | 組み込み送信のままなので第三者に届かず、Resend にも記録が残らない。**設定ミスに見える** | 手順 7 → 手順 9 の順を守る |
| **`[storage.vector]` の既定値で push が止まる** | Free プランでは vector buckets を使えず **402** で停止。Auth は適用済みなのに失敗に見える | `enabled = false` にしてホスト版の実態に合わせる |
| Hook を宣言せず push | JWT の `x-hasura-user-id` が消え、**全クエリが 0 件**になる | `[auth.hook.custom_access_token]` を有効のまま保ち、push 後に `verify-hook.md` で確認 |
| ドメイン検証前に試す | 自分の登録アドレスにしか届かず、成功したと誤認する | 外部プロバイダのアドレスで確認する |
| 自分の常用アドレスで検証する | 元々届くため切り替えを検証できない | 別のアドレスを使う |
| 同じアドレスで再試行 | すでに登録済みで確認メールが飛ばない | 新しいアドレスか `+` エイリアスを使う |
| `env()` を解決せずに push | SMTP のパスワードが空で適用され、送信が全滅する | `make supabase-push` を使う（`.env` を読み込む） |
| API キーを config.toml に直接書く | Git にコミットされて漏れる | `env(RESEND_API_KEY)` で参照し、値は `.env` に置く |
| Resend の Logs を見て「送っていない」と誤判断 | **Logs は API リクエストの記録**で、SMTP 送信は出ない | **Emails** タブを見る |
| Cloudflare の Email Security 分析を鵜呑みにする | SPF / DKIM が「不合格」と出る。**DKIM は誤判定**（`resend` セレクタを知らないだけ） | Resend 側の Verified と `dig` の結果を信じる |
