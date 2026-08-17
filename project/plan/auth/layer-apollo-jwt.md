---
type: Task
title: 層 2 — 共通 Apollo クライアントの JWT 対応
description: 鍵を運ぶ配管。admin secret を消し、トークンを返す関数を受け取る形にする。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/23
tags: [auth, packages-graphql, 層2]
status: stable
stale_after: 2026-09-18
generated: { by: claude-code/claude-fable-5, at: 2026-08-17T23:32:00Z }
---

# 位置づけ

**鍵を運ぶ配管。** 3 アプリが共有する層なので、ここを直せば各アプリの仕事は
「どうトークンを取るか」だけに絞られる。

ブランチ: `feat/23-apollo-jwt`（層 1 の上に `gh stack add`）

# やること

完了条件は Issue [#23](https://github.com/Hitamuki/study-web-modern-stack/issues/23) の AC が正本。

| 対象 | 内容 |
| :- | :- |
| `packages/graphql/src/ApolloProvider.tsx` | `adminSecret` を削除し `getToken: () => Promise<string \| null>` を受け取る。**トークンそのものではなく関数**を渡すのは、取得方法が 3 アプリで違うため |
| 同上 | Apollo Client **v4** の作法で auth link を組む（`SetContextLink` / `ApolloLink.from`）。v3 と書き方が違う |
| 同上 | `uri` を環境変数から。**3 アプリで読み方が違う**（Vite の `import.meta.env` / Expo の `EXPO_PUBLIC_` / electron-vite）ため、props 経由で各アプリが渡す形が素直 |
| `packages/graphql/codegen.ts` | ここにも admin secret がハードコードされている。環境変数化する |
| 生成型 | `pnpm --filter @repo/graphql codegen` を再実行（`owner_id` を含む型に更新） |

# 呼び出し側 3 箇所も直す

`ApolloProvider` は props 無しで 3 箇所から呼ばれている。引数を変えるので全部直す。

| アプリ | ファイル | 対応 |
| :- | :- | :- |
| web | `apps/web/src/app/App.tsx` | 層 5 で Supabase のトークンを渡す |
| desktop | `apps/desktop/src/renderer/main.tsx` | `getToken: async () => null` |
| mobile | `apps/mobile/App.tsx`（**`src/` の外**） | `getToken: async () => null` |

**mobile / desktop は Issue #25 が保留のため、ビルドは通るが未認証で動かなくなる。**
これは意図した状態で、Issue [#20](https://github.com/Hitamuki/study-web-modern-stack/issues/20) にも
「その状態で公開してはいけない」と記録がある。
