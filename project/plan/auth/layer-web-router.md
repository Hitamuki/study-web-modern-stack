---
type: Task
title: 層 4 — apps/web へのルーター導入
description: 認証 4 画面 + ダミー画面の遷移に必要。ライブラリ選定の Discussion が未起票のためブロック中。
tags: [auth, apps-web, 層4, ブロッカー, 要選定]
status: draft
stale_after: 2026-09-18
generated: { by: claude-code/claude-fable-5, at: 2026-08-17T23:32:00Z }
---

# 位置づけ

`apps/web` にルーターが無い。`App.tsx` は 9 行で `<ApolloProvider><DummyPage /></ApolloProvider>` を返すだけ。
SCR-001〜004 の 4 画面 + ダミー画面（SCR-005）の遷移には必要になる。

ブランチ: `feat/NN-web-router`（層 3 の上に `gh stack add`）

> [!WARNING]
> **Issue も Discussion も未起票。この層だけ準備ができていない。**

# 先に Discussion が要る

ルーターは AGENTS.md の技術選定対象「状態管理・データ取得・UI 基盤」に当たり、
ルートを定義した後の乗り換えコストが高い。**着手前に Discussion を立てて決着させる。**

候補: React Router / TanStack Router / wouter

選定の進め方は [.github/guides/TECH_DECISIONS.md](../../../.github/guides/TECH_DECISIONS.md) が正本。
評価軸を先に決めてから候補を並べ、比較表を本文に入れ、結論はコメントで投稿して Answer にマークする。

# やること（決着後）

- 選定したルーターを catalog（`frontend`）に追加
- 既存のダミー画面を `/` に載せ替える
- 認証画面のルートを用意する。パスワード再設定の戻り先（`resetPasswordForEmail` の `redirectTo`）が
  実 URL になるため、層 5 の実装が素直になる

# 代替案（採らなかった）

ルーターを入れず、認証状態と `PASSWORD_RECOVERY` イベントで表示を切り替える案もあった。
層 5 を認証に集中させられ Discussion 待ちも発生しないが、URL が変わらずブックマークできない。
**ルーターを先に入れる方針をユーザーが選択した。**
