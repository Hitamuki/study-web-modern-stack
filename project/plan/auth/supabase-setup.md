---
type: Task
title: Supabase プロジェクトのセットアップ
description: 層 1 のブロッカー。プロジェクト作成と Custom Access Token Hook の登録はユーザー本人の作業。
resource: https://github.com/Hitamuki/study-web-modern-stack/discussions/19
tags: [auth, supabase, ブロッカー, ユーザー作業]
status: stable
stale_after: 2026-09-18
generated: { by: claude-code/claude-fable-5, at: 2026-08-17T23:32:00Z }
sources:
  - resource: https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook
    title: Custom Access Token Hook
    last_modified: 2026-08-17
  - resource: https://supabase.com/docs/guides/auth/signing-keys
    title: JWT Signing Keys
    last_modified: 2026-08-17
---

# これが済むまで実装に入れない

Issue [#22](https://github.com/Hitamuki/study-web-modern-stack/issues/22) の AC が
「発行した JWT で自分のレコードだけ取得できる」「別ユーザーの JWT では取得できない」を要求している。
**実際に Supabase が署名した JWT が無いと検証できない。**

サインアップとダッシュボード操作は代行できないため、**ユーザー本人の作業**。

# 手順

1. supabase.com でサインアップ（GitHub アカウント可・クレジットカード不要）
2. プロジェクトを作成（無料プロジェクトは 2 つまで）
3. SQL Editor で下記の Hook 関数を作成する
4. Authentication → Hooks で Custom Access Token として登録する
5. **`project-ref` を共有する** → `jwk_url` が確定して層 1 に着手できる

```sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable as $$
begin
  return jsonb_set(event, '{claims,https://hasura.io/jwt/claims}', jsonb_build_object(
    'x-hasura-default-role',  'user',
    'x-hasura-allowed-roles', jsonb_build_array('user'),
    'x-hasura-user-id',       event->>'user_id'
  ));
end; $$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
```

> [!IMPORTANT]
> **Hook はアプリのテーブルを読まない純粋関数にする。**
> Hook は Supabase 側の PostgreSQL で動く。ローカル開発ではアプリの DB が
> Docker の別インスタンスなので、アプリのテーブルは見えない。
> 当面はロールを固定（全員 `user`）してこの制約を満たす。

# 確定する値

| 値 | 用途 |
| :- | :- |
| `project-ref` | `jwk_url` = `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json` |
| anon key（publishable key） | `apps/web` の Supabase クライアント初期化 |

# 検証

Hook の登録後、ログインして得た JWT をデコードし、
`https://hasura.io/jwt/claims` の下に `x-hasura-user-id` が入っていることを確認する。
**ここが入っていないと層 1 以降がすべて空振りする。**

# 未検証の懸念

**Supabase Free は 7 日間の低活動でプロジェクトが一時停止し、90 日で永久削除される。**
学習用に常設したい方針と衝突するため、Discussion
[#29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29)（ホスティング先の選定）で扱う。
