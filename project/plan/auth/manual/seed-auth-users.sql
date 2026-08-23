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
--
-- ------------------------------------------------------------------------
-- パスワードについて
-- ------------------------------------------------------------------------
-- **このファイルにパスワードを書かないこと。** リポジトリは公開されており、
-- 一度コミットすると履歴から消えない。
--
-- そのためパスワードは**スクリプト側でランダム生成し、実行結果に 1 度だけ表示する**。
-- 表示された値をパスワードマネージャなどに控えて使う。
-- 生成値ではなく決まったパスワードを使いたい場合は、作成後にダッシュボードの
-- Authentication > Users から変更する（ファイルを書き換えない）。
-- ------------------------------------------------------------------------

create extension if not exists pgcrypto;

do $$
declare
  -- 作成するメールアドレス。ここは秘匿値ではないので書き換えてよい。
  emails constant text[] := array['test-a@example.com', 'test-b@example.com'];
  user_email text;
  user_pass  text;
  uid        uuid;
begin
  foreach user_email in array emails loop
    -- 既にいるなら作り直さない（複数回流しても安全にする）
    if exists (select 1 from auth.users where email = user_email) then
      raise notice 'skip (already exists): %', user_email;
      continue;
    end if;

    uid := gen_random_uuid();
    -- ランダムなパスワードを生成する。ファイルには残らない。
    user_pass := replace(encode(gen_random_bytes(18), 'base64'), '/', '_');

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

    -- ここでしか表示されない。閉じる前に控えること。
    raise notice 'created: % / password: % / id: %', user_email, user_pass, uid;
  end loop;
end $$;

-- 作成結果の確認。ここで出た id を dummy.owner_id に使う（パスワードは出ない）
select id, email, email_confirmed_at is not null as confirmed
from auth.users
order by created_at desc
limit 5;
