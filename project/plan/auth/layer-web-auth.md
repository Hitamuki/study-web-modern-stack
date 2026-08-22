---
type: Task
title: 層 5 — Web への認証フロー導入と admin secret の削除
description: 鍵を手に入れる層。SCR-001〜004 を実装し、admin secret を消す。ここが壊れる瞬間。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/24
tags: [auth, apps-web, supabase, 層5]
status: stable
stale_after: 2026-09-18
generated: { by: claude-code/claude-fable-5, at: 2026-08-17T23:32:00Z }
sources:
  - resource: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
    title: resetPasswordForEmail と PASSWORD_RECOVERY
    last_modified: 2026-08-17
---

# 位置づけ

**鍵を手に入れる層。そして唯一「壊れる瞬間」。**
admin secret を消した時点で層 2 が入っていないと、Web は何も取得できなくなる。

ブランチ: `feat/24-web-auth`（層 4 の上に `gh stack add`）

# 着手順（この順でないと lint が落ちる）

1. **`apps/web/src/app/styles.css` に `--pen-danger-bg` と `--pen-gap-lg` を追加し、`@theme inline` に割り当てる**
   ESLint の `better-tailwindcss` が `recommended-error` で効いており、
   **`@theme` に無いクラスを書くとエラーになる**。これを飛ばすと後の実装が全部落ちる
2. `@supabase/supabase-js` を catalog（`frontend`）に追加
3. `npx shadcn add input label card` で不足コンポーネントを追加（`components.json` は
   `@/shared/ui` に置く設定済み。`shared/ui/` には現在 `Button.tsx` と `dialog.tsx` しかない）
4. 画面を実装する

# 画面

完了条件は Issue [#24](https://github.com/Hitamuki/study-web-modern-stack/issues/24) の AC が正本。
意匠の正本は [docs/screen-list.md](../../../docs/screen-list.md) と `docs/screens/*.png`（書き出し済み）。

| 画面 | 内容 |
| :- | :- |
| SCR-001 ログイン | エラー帯が出た状態の設計あり |
| SCR-002 アカウント作成 | 確認メール送信の案内まで |
| SCR-003 パスワードリセット申請 | `resetPasswordForEmail(email, { redirectTo })` |
| SCR-004 新しいパスワードの設定 | `onAuthStateChange` の **`PASSWORD_RECOVERY` イベント**で入る |

4 画面とも同じカード構造（アプリ名 → 見出し → 説明 → 入力欄 → 主ボタン → 補助リンク）。
PC は幅 440px を中央、SP は左右 24px 余白。

エラー表示は `danger-bg` の帯を**見出しと入力欄の間**に置く。
**入力項目ごとのインラインエラーは持たせない**（設計どおり）。

# 既存パターンに合わせる

フォームライブラリもスキーマバリデータも入っていない。既存は
**controlled + props リフトアップ + ページ側で 1 行バリデーション**（`DummyForm` / `DummyPage`）。
**ライブラリは足さない。**

# トークンの保存場所

**supabase-js 既定の localStorage を受容する。**

`apps/web` はサーバーを持たない Vite の SPA で、httpOnly Cookie を発行する主体が無いため。
Wiki [認証・認可](https://github.com/Hitamuki/study-web-modern-stack/wiki/Authentication-Authorization)
の推奨（httpOnly Cookie）とは食い違うので、**未達として理由つきで Wiki に明記**し、
将来の課題（NestJS の BFF 化）として残す。

# メールの確認は自分のアドレスまで

SCR-002 の確認メールと SCR-003 のリセットメールは、**Supabase の組み込み送信では
組織メンバーのアドレスにしか届かず、上限は 2 通/時**。

**層 5 はこれを待たない。** 自分のアドレス宛なら通しで確認できる。
第三者に届く状態にするのは Issue [#71](https://github.com/Hitamuki/study-web-modern-stack/issues/71) の担当で、
詳細は [email-delivery.md](/project/plan/auth/email-delivery.md) を参照。

# 仕上げ

- `ApolloProvider` に `getToken`（`supabase.auth.getSession()` 由来）を渡し、**admin secret を削除**
- `docs/screen-list.md` の「実装」列を埋める
- `apps/web/index.html` の `<title>` が `ダミー画面 | メモ` のまま。更新する
