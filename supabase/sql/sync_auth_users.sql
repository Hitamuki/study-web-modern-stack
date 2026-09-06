-- auth.users から public.users への同期。
--
-- 適用: make supabase-sql
--
-- auth スキーマは Supabase の管理下で Prisma が触らないため、
-- **アプリ側の users 行を作るのはこのトリガーの責務**になる（#101）。
-- public.users の定義そのものは apps/api/prisma/schema.prisma が正本。
--
-- サインアップ直後に public.users の行が無いと、dummy への外部キーが張れず
-- 最初のメモ作成が失敗する。auth.users への挿入と同じトランザクションで作る。

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- トリガー導入前に作られた既存ユーザーを取り込む。何度流しても安全。
insert into public.users (id)
select id from auth.users
on conflict (id) do nothing;
