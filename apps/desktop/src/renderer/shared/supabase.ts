import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * Supabase Auth のクライアント（Discussion #19）。
 *
 * **トークンは renderer が持つ。** main に持たせると IPC の往復が必要になり、
 * Web との実装差が広がるため。
 *
 * セッションの保存先は supabase-js 既定の `localStorage`。
 * renderer を `app://` のカスタムプロトコルで読み込んでおり、正規のオリジンがあるため使える。
 * `file://` のままだと `localStorage` が不安定で `getSession` が null を返す（#25）。
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};
