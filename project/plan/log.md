# 更新履歴

新しいものが上です。計画の追加・方針の変更・陳腐化をここに記録します。

## 2026-08-23

- **`seed-auth-users.sql` を削除した。** ホストされた Supabase では `postgres` ロールが
  `auth.users` の所有者ではなく、直接 INSERT が `ERROR 42501: must be owner of table users`
  で失敗する（意図的なプラットフォーム制限）。ローカルで検証していたのは自前で模した
  `auth` スキーマだったため、この制限を再現できていなかった。
  代わりに Admin API を叩く `create-test-users.sh` を用意した。
  **メールアドレスを引数で受け取る**ため、個人のアドレスがリポジトリに残らない。

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
