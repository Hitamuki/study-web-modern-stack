import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../config/env";

/**
 * Supabase Auth のクライアント（Discussion #19）。
 *
 * セッションの保存先は supabase-js 既定の `localStorage`。
 * `apps/web` はサーバーを持たない Vite の SPA で、httpOnly Cookie を発行する主体が無いため。
 * Wiki「認証・認可」の推奨（httpOnly Cookie）とは食い違うので、**未達として承知のうえ**採用している。
 * 将来 NestJS を BFF にする案は別途検討する。
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/**
 * Apollo に渡すトークン取得関数。
 * リクエストのたびに呼ばれるため、リフレッシュ後の最新のトークンが載る。
 */
export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};
