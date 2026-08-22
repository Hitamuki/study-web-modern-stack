---
type: Task
title: 層 4 — apps/web へのルーター導入
description: 認証 4 画面 + ダミー画面の遷移に必要。Discussion #75 が未決着のためブロック中。
tags: [auth, apps-web, 層4, ブロッカー, 要選定]
resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/75
status: stable
stale_after: 2026-09-18
generated: { by: claude-code/claude-fable-5, at: 2026-08-22T00:00:00Z }
---

# 位置づけ

`apps/web` にルーターが無い。`App.tsx` は 9 行で `<ApolloProvider><DummyPage /></ApolloProvider>` を返すだけ。
SCR-001〜004 の 4 画面 + ダミー画面（SCR-005）の遷移には必要になる。

ブランチ: `feat/NN-web-router`（層 3 の上に `gh stack add`）

> [!WARNING]
> **Discussion [#75](https://github.com/Hitamuki/study-web-modern-stack/discussions/75) は起票済みだが未決着。
> Issue はまだ起票していない**（決着後に起票する）。

# 先に Discussion を決着させる

ルーターは AGENTS.md の技術選定対象「状態管理・データ取得・UI 基盤」に当たり、
ルートを定義した後の乗り換えコストが高い。

Discussion [#75](https://github.com/Hitamuki/study-web-modern-stack/discussions/75) で
**「ルーターに何を使うか」ではなく「URL が担う役割は何か」から掘り直している。** 要点は 2 つ。

- URL の役割は **(a) 外部から特定の状態へ入る入口**（メールのリンク → SCR-004）と
  **(b) アプリ内の画面切り替え**に分かれ、URL でしか実現できないのは (a) だけ
- **H0（ルーターを入れない）は軸 2 で落選**。`PASSWORD_RECOVERY` イベントで (a) は代替できるが、
  ブラウザの履歴に積まれず全画面が `/` に潰れるため、将来の作り直しが確定する

主仮説は **H1（wouter などの軽量ルーター）**。候補表の値は未検証で空欄のまま。

**この Discussion は #22 / #23 / 層 3 に依存しない。並行して決着させてよい。**

# やること（決着後）

- 選定したルーターを catalog（`frontend`）に追加
- 既存のダミー画面を `/` に載せ替える
- 認証画面のルートを用意する。パスワード再設定の戻り先（`resetPasswordForEmail` の `redirectTo`）が
  実 URL になるため、層 5 の実装が素直になる

# 代替案（採らなかった）

ルーターを入れず、認証状態と `PASSWORD_RECOVERY` イベントで表示を切り替える案もあった。
層 5 を認証に集中させられ Discussion 待ちも発生しないが、URL が変わらずブックマークできない。
**ルーターを先に入れる方針をユーザーが選択した。**
