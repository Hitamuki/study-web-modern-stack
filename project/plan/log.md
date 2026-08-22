# 更新履歴

新しいものが上です。計画の追加・方針の変更・陳腐化をここに記録します。

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
