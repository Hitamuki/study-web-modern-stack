-- Custom Access Token Hook。Supabase が発行する JWT に Hasura のクレームを注入する。
--
-- 適用: make supabase-sql
-- 登録: supabase/config.toml の [auth.hook.custom_access_token] が
--       pg-functions://postgres/public/custom_access_token_hook を指している。
--
-- **このファイルが正本。** 以前は Supabase の DB 上にしか存在せず、
-- config.toml が URI で参照しているだけだった（#101 でリポジトリに入れた）。
--
-- 変更したら make verify-hook 相当の確認を行うこと。Hook が壊れると JWT に
-- x-hasura-user-id が入らず、**Hasura の行レベル権限が全件を弾いて 0 件になる。**
-- 確認手順: project/plan/auth/manual/verify-hook.md

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claimed_role text;
begin
  -- public.users からロールを読む。DB が Supabase に一本化されたので参照できる（#101）。
  --
  -- 行が無い場合は user にフォールバックする。auth.users への挿入と
  -- public.users へのトリガーの間に競合が起きても、認証そのものは通す必要があるため。
  select u.role into claimed_role
  from public.users u
  where u.id = (event->>'user_id')::uuid;

  claimed_role := coalesce(claimed_role, 'user');

  return jsonb_set(event, '{claims,https://hasura.io/jwt/claims}', jsonb_build_object(
    'x-hasura-default-role',  claimed_role,
    'x-hasura-allowed-roles', jsonb_build_array(claimed_role),
    'x-hasura-user-id',       event->>'user_id'
  ));
end;
$$;

-- Hook を実行できるのは Supabase の認証サービスだけにする。
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

-- Hook は public.users を読むため、認証サービスに読み取り権限が要る。
grant usage on schema public to supabase_auth_admin;
grant select on table public.users to supabase_auth_admin;
