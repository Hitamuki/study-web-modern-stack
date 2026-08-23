-- Supabase Auth に検証用ユーザーを作る SQL。
--
-- **実行先は Supabase プロジェクトのデータベース**（ダッシュボードの SQL Editor）。
-- リポジトリの docker-compose の PostgreSQL ではない。auth スキーマは Supabase 側にしか存在しない。
--
-- 前提: メール確認を経ずにログインできる状態にするため email_confirmed_at を埋めている。
--       Supabase の組み込みメールは組織メンバー宛・2 通/時のため、確認メールに頼れない（Issue #71）。
--
-- 注意: Supabase 公式は auth スキーマへの直接 INSERT を推奨していない（Auth API の利用を推す）。
--       ここでは「検証用ユーザーを 2 人だけ手早く作る」用途に限って使う。
--       本番のユーザー作成に流用しないこと。

create extension if not exists pgcrypto;

do $$
declare
  -- ここを書き換えて使う
  users constant jsonb := '[
    {"email": "test-a@example.com", "password": "test1234"},
    {"email": "test-b@example.com", "password": "test1234"}
  ]';
  u          jsonb;
  uid        uuid;
  user_email text;
  user_pass  text;
begin
  for u in select * from jsonb_array_elements(users) loop
    user_email := u ->> 'email';
    user_pass  := u ->> 'password';

    -- 既にいるなら作り直さない（複数回流しても安全にする）
    if exists (select 1 from auth.users where email = user_email) then
      raise notice '既に存在するため作成をとばす: %', user_email;
      continue;
    end if;

    uid := gen_random_uuid();

    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) values (
      uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      user_email,
      -- Blowfish（bcrypt）でハッシュ化する。平文を入れるとログインできない
      crypt(user_pass, gen_salt('bf')),
      now(),  -- メール確認済みとして扱う
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(), now()
    );

    -- 近年の Supabase は identities が無いとサインインできない
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      uid,
      jsonb_build_object('sub', uid::text, 'email', user_email),
      'email',
      uid::text,
      now(), now(), now()
    );

    raise notice '作成した: % (%)', user_email, uid;
  end loop;
end $$;

-- 作成結果の確認。ここで出た id を dummy.owner_id に使う
select id, email, email_confirmed_at is not null as confirmed
from auth.users
order by created_at desc
limit 5;
