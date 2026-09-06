-- SCR-005 ダミー画面の動作確認用シード。design/app.pen のサンプル 4 件と対応します。
-- 実行: make db-seed
--
-- #22 で「別ユーザーのレコードが取得できない」ことを確認するため、意図的に 2 ユーザー分に分けています。
--   ユーザー A: :owner_a（.env の SUPABASE_USER_UID_1。**実在する検証用ユーザー**。3 件）
--   ユーザー B: :owner_b（他人役。auth.users には存在しない。1 件）
--
-- dummy.owner_id は public.users への外部キーになったため（#101）、
-- 先に users の行を作ってから dummy を入れます。
--
-- ユーザー B は auth.users に存在しません。**ログインできない代わりに、
-- 「他人のレコード」を用意する役**として public.users にだけ置きます。
-- public.users から auth.users への外部キーは張っていないため成立します。

INSERT INTO users (id) VALUES (:'owner_a') ON CONFLICT (id) DO NOTHING;
INSERT INTO users (id) VALUES (:'owner_b') ON CONFLICT (id) DO NOTHING;

DELETE FROM dummy WHERE owner_id IN (:'owner_a', :'owner_b');

INSERT INTO dummy (owner_id, content, created_at, updated_at) VALUES
  (:'owner_a', '買い物リスト: 牛乳、卵、パン、コーヒー豆',           '2026-08-10 08:00:00+09', '2026-08-15 09:12:00+09'),
  (:'owner_a', '会議メモ: 次回スプリントのゴールを再確認する',       '2026-08-11 10:20:00+09', '2026-08-14 18:40:00+09'),
  (:'owner_a', 'Pencil 検証: 画面 ID とフレーム名の運用ルールを決める', '2026-08-12 09:00:00+09', '2026-08-13 11:05:00+09'),
  (:'owner_b', '読書メモ: DDD の集約境界の切り方について',           '2026-08-12 20:00:00+09', '2026-08-12 21:30:00+09');
