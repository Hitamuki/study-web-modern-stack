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
-- そのためパスワードは**スクリプト側でランダム生成し、実行結果の表に出す**。
-- SQL Editor の結果ペインに表示されるので、閉じる前に控えること。
-- （RAISE NOTICE は SQL Editor に出ないため、結果セットとして返している）
--
-- 決まったパスワードを使いたい場合は、作成後にダッシュボードの
-- Authentication > Users から変更する（ファイルを書き換えない）。
-- ------------------------------------------------------------------------

create extension if not exists pgcrypto;

-- 全体を 1 文にしている。SQL Editor は文ごとに接続が変わりうるため、
-- 一時テーブルや PL/pgSQL の変数をまたいで受け渡せないことがある。
with input as (
  -- 作成するメールアドレス。ここは秘匿値ではないので書き換えてよい。
  select unnest(array['test-a@example.com', 'test-b@example.com']) as email
),
-- volatile な関数を含む CTE は materialized にして 1 度だけ評価させる。
-- 明示しないと参照ごとに別の UUID / パスワードが生成されうる。
prepared as materialized (
  select
    input.email,
    gen_random_uuid() as id,
    -- URL やコマンドラインで扱いやすいよう / と + を置き換える
    translate(encode(gen_random_bytes(18), 'base64'), '/+', '__') as password
  from input
  -- 既にいるなら作らない（複数回流しても安全にする）
  where not exists (select 1 from auth.users u where u.email = input.email)
),
new_users as (
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  select
    p.id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    p.email,
    -- Blowfish（bcrypt）でハッシュ化する。平文を入れるとログインできない
    crypt(p.password, gen_salt('bf')),
    now(),  -- メール確認済みとして扱う
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(), now()
  from prepared p
  returning id
),
new_identities as (
  -- 近年の Supabase は identities が無いとサインインできない
  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  )
  select
    gen_random_uuid(),
    p.id,
    jsonb_build_object('sub', p.id::text, 'email', p.email),
    'email',
    p.id::text,
    now(), now(), now()
  from prepared p
  returning user_id
)
-- ここに出た password を控える。二度と表示されない。
-- 0 行なら「既に全員存在する」という意味（何も作られていない）。
select email, password, id as user_id from prepared order by email;
