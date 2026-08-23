---
type: Runbook
title: Custom Access Token Hook が効いているか確かめる
description: JWT に x-hasura-* クレームが入っているかを確認する。ここが空だと以降がすべて空振りする。
resource: https://github.com/Hitamuki/study-web-modern-stack/issues/74
tags: [auth, supabase, hasura, 人間の作業, 手順書]
status: stable
stale_after: 2026-09-23
generated: { by: claude-code/claude-fable-5, at: 2026-08-23T00:00:00Z }
---

# なぜここで止めるか

Hook が効いていないと JWT に `x-hasura-user-id` が入りません。すると Hasura の行レベル権限
`owner_id = X-Hasura-User-Id` が**全件を弾いて 0 件を返します**。

**この状態は「権限設定が壊れている」ように見えますが、実際には設計どおりに動いています。**
先に進むと原因の切り分けに時間を溶かすので、ここで確かめます。

# 確認

```bash
TOKEN=$(curl -s -X POST "https://kdhyeuasgxdlkzwqfbij.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: <publishable key>" -H 'Content-Type: application/json' \
  -d '{"email":"test-a@example.com","password":"test1234"}' | jq -r .access_token)

echo "$TOKEN" | cut -d. -f2 | tr '_-' '/+' \
  | awk '{l=length($0)%4; if(l==2)$0=$0"=="; else if(l==3)$0=$0"="; print}' \
  | base64 -d 2>/dev/null | jq '{sub, aud, iss, hasura: .["https://hasura.io/jwt/claims"]}'
```

## 期待する出力

```json
{
  "sub": "<ユーザーの UUID>",
  "aud": "authenticated",
  "iss": "https://kdhyeuasgxdlkzwqfbij.supabase.co/auth/v1",
  "hasura": {
    "x-hasura-default-role": "user",
    "x-hasura-allowed-roles": ["user"],
    "x-hasura-user-id": "<sub と同じ UUID>"
  }
}
```

**`hasura` が `null` なら Hook が効いていません。**

# 効いていない場合

1. ダッシュボード → **Authentication → Hooks** で **Customize Access Token (JWT) Claims** が
   **Enabled** かつ `public.custom_access_token_hook` を指しているか
2. SQL Editor で関数と権限を確認する

```sql
select proname from pg_proc where proname = 'custom_access_token_hook';

-- 権限が無いと実行時に落ちる
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
```

3. それでも駄目なら `grant usage on schema public to supabase_auth_admin;` も実行する

# 併せて確認すること

`iss` と `aud` が上記と一致していること。**Hasura はこの 2 つも照合します**
（`docker-compose.yml` の `HASURA_GRAPHQL_JWT_SECRET`）。食い違うとトークンが弾かれます。

**次は [env-setup.md](/project/plan/auth/manual/env-setup.md) です。**
