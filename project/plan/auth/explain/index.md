# 認証・認可のしくみ（解説）

この計画で何をやろうとしているのかを、**前提知識なしで読める形**にまとめたものです。

作業の手順は [manual/](/project/plan/auth/manual/index.md)、順序と依存は
[../index.md](/project/plan/auth/index.md) にあります。ここは「なぜ」と「なに」の説明だけです。

## 読む順序

| # | ファイル | 答える問い |
| :- | :- | :- |
| 1 | [goal.md](/project/plan/auth/explain/goal.md) | 目的はなにか。ゴールはなにか。なぜやるのか |
| 2 | [supabase.md](/project/plan/auth/explain/supabase.md) | Supabase とはなにか。何ができるか。何を使うか |
| 3 | [how-it-works.md](/project/plan/auth/explain/how-it-works.md) | どういう仕組みで守られるのか |
| 4 | [settings.md](/project/plan/auth/explain/settings.md) | 何をどう設定するか |
| 5 | [tech-stack.md](/project/plan/auth/explain/tech-stack.md) | 技術要素はなにか |

## ひとことで言うと

**いまは「鍵のかかっていない家」です。** 誰でも全部のメモを読み書きできます。

この計画で**「住人ごとに部屋の鍵を配る」**状態にします。
鍵を配るのが Supabase、鍵を確認して部屋に通すのが Hasura です。
