# 更新履歴

新しいものが上です。計画の追加・方針の変更・陳腐化をここに記録します。

## 2026-08-24

- **`supabase/config.toml` を作成し、Supabase の認証設定をコード管理に移した。**
  `supabase init` で雛形を出し、本プロジェクトの現在値に合わせて調整した（`site_url` を Vite の 5173、
  `additional_redirect_urls` を SCR-004 の `/password-update`、`enable_confirmations` を true）。
  適用は `make supabase-push`（`supabase config push` のラッパー）。
- **`[auth.hook.custom_access_token]` を明示的に宣言した。** 雛形はコメントアウトされており、
  そのまま push すると **Hook が無効化されて JWT から `x-hasura-user-id` が消え、
  Hasura の行レベル権限が全件を弾く**（0 件になり権限バグに見える）。`config push` には
  dry-run も diff も無いため、Makefile 側に確認プロンプトと警告を入れた。
- **API キーの置き場所を前日の結論から変更した。** config.toml が
  `pass = "env(RESEND_API_KEY)"` で参照するため、**リポジトリ直下の `.env` に置く**のが正しくなった。
  `.env.example` にコメントだけ置いていたのを実変数に変えた。
  `apps/api/.env` に置かない理由は変わらず「NestJS がメールを送らず読む主体がいない」。
- **[docs/context-map.md](/docs/context-map.md) を現状に更新した。** 3 月時点の図には認証が無かったため、
  Supabase Auth / Hook / JWKS 検証 / 行レベル権限 / Actions の共有シークレット / Resend を追加し、
  未実装の経路（Resend・mobile・desktop）を破線で区別した。PostgreSQL が 2 つある理由も明記した。

## 2026-08-23

- **認証メールの配信経路を Resend に確定し、手順書と解説を追加した。**
  [manual/resend-smtp.md](/project/plan/auth/manual/resend-smtp.md)（ダッシュボードと DNS の作業）と
  [explain/email.md](/project/plan/auth/explain/email.md)（誰がメールを送るのかの解説）を新設し、
  [auth/email-delivery.md](/project/plan/auth/email-delivery.md) に決定内容を反映した。
- **Resend の API キーはリポジトリに置かないことを明文化した。** `apps/api` も `apps/web` も
  送信処理を持たず、キーを読む処理が無いため。`.env` が `.gitignore` 済みで安全かどうかとは別の話で、
  **使われない環境変数を増やすと「設定したのに動かない」の原因になる**という理由。
  `.env.example` には変数ではなく所在を示すコメントだけを置いた。
  置き場所が変わる条件（Send Email Hook への切り替え / ローカル Supabase の `config.toml`）も記録した。
- **#71 の律速は Discussion #46（サービス名）のまま。** Resend はドメイン検証まで
  `onboarding@resend.dev` から自分の登録アドレスにしか送れず、**サービスを決めたことで前倒しできる作業は無い。**

- **通しの検証が完了した。** 実ユーザー 2 人で行レベル権限の分離を確認
  （ユーザー A は自分の 3 件のみ、B は 1 件のみ、トークン無しは拒否）。
  Actions 経由の作成・更新・削除も確認し、他人のレコードへの更新・削除が拒否されることを実測した。
- [auth/explain/](/project/plan/auth/explain/index.md) を追加。初学者向けの解説として
  目的とゴール / Supabase とは / 仕組み / 設定の意味 / 技術要素の 5 本を置いた。

- **`seed-auth-users.sql` を削除した。** ホストされた Supabase では `postgres` ロールが
  `auth.users` の所有者ではなく、直接 INSERT が `ERROR 42501: must be owner of table users`
  で失敗する（意図的なプラットフォーム制限）。ローカルで検証していたのは自前で模した
  `auth` スキーマだったため、この制限を再現できていなかった。
  代わりに Admin API を叩くスクリプトを用意したが、**これも削除した**。
  service_role キー（全権）の取り回しが必要で、検証用に 2 人作るだけならダッシュボードの
  Add user（Auto Confirm）のほうが安全なため。**手順書には方法 A だけを残した。**
  試して失敗した記録は `manual/supabase-users.md` に残している。

- [auth/manual/](/project/plan/auth/manual/index.md) を追加。**5 層の実装が完了した**ため、
  残りの人間の作業（検証用ユーザーの作成・Hook の確認・環境変数・シードの差し替え）を手順書にした。
- `seed-auth-users.sql` を追加。`auth.users` と `auth.identities` に検証用ユーザーを作る SQL。
  **ローカルの `auth` スキーマを模して実行検証済み**（bcrypt ハッシュの照合と冪等性を確認）。
- Discussion #75 が React Router v7 で決着。Issue #76（ルーター導入）を起票し実装した。
- `mise.toml` に `supabase` CLI を追加した。

## 2026-08-22

- Issue [#74](https://github.com/Hitamuki/study-web-modern-stack/issues/74)（Supabase プロジェクトのセットアップ）を起票。
  #22 と #71 の共通の前提でありながら、どの Issue にも属していなかったため独立させた。
- Discussion [#75](https://github.com/Hitamuki/study-web-modern-stack/discussions/75)（画面遷移と URL の扱い）を起票。
  **「ルーターに何を使うか」ではなく「URL が担う役割は何か」から掘り直した。**
  H0（入れない）はブラウザ履歴の観点で落選、主仮説は H1（軽量ルーター）。

- [auth/email-delivery.md](/project/plan/auth/email-delivery.md) を追加。
  Supabase の組み込みメール送信が組織メンバー宛・2 通/時に限られる件と、Issue
  [#71](https://github.com/Hitamuki/study-web-modern-stack/issues/71)（Resend の custom SMTP 化）との関係を記録した。
  **層 5 はこれを待たない**（自分のアドレス宛なら確認できる）点を明示。

## 2026-08-18

- `project/plan/` を新設（Issue [#72](https://github.com/Hitamuki/study-web-modern-stack/issues/72)）。
  形式は OKF v0.2。AGENTS.md の「ドキュメントの置き場所」に 1 行追加した。
- [auth/](/project/plan/auth/index.md) を追加。認証・認可（Issue
  [#20](https://github.com/Hitamuki/study-web-modern-stack/issues/20)）の 5 層の積み方と、
  着手前に判明した 5 つの事実を記録。
