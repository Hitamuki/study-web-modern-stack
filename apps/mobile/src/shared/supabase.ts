import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

/**
 * SecureStore は 1 件あたり 2048 バイトの上限があり、**Supabase のセッションは既定でこれを超える**
 * （access_token / refresh_token / user を含む JSON）。そのまま渡すと保存時にエラーになる。
 *
 * そこで値を分割して複数のキーに保存する。UTF-8 で 1 文字が最大 3 バイトになりうるため、
 * 上限の 3 分の 1 を下回る長さで切って、マルチバイト文字が混ざっても超えないようにしている。
 */
const CHUNK_LENGTH = 600;

/** 分割数を記録するキー。本体は `<key>.0`, `<key>.1`, ... に入る */
const countKey = (key: string) => `${key}.chunks`;
const chunkKey = (key: string, index: number) => `${key}.${index}`;

const readCount = async (key: string): Promise<number> => {
  const raw = await SecureStore.getItemAsync(countKey(key));
  const count = raw === null ? 0 : Number.parseInt(raw, 10);
  return Number.isFinite(count) && count > 0 ? count : 0;
};

/**
 * SecureStore を supabase-js のストレージとして使うアダプタ。
 *
 * 既定の `localStorage` は React Native に存在しない。`AsyncStorage` でも動くが
 * **平文で保存される**ため、トークンの保存先としては使わない（#25 の AC）。
 * SecureStore は iOS の Keychain / Android の Keystore に預ける。
 */
const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const count = await readCount(key);
    if (count === 0) return null;
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, i) => SecureStore.getItemAsync(chunkKey(key, i))),
    );
    // 途中が欠けていたら壊れているので、部分的に復元せず null を返す（再ログインさせる）
    if (chunks.some((chunk) => chunk === null)) return null;
    return chunks.join("");
  },

  setItem: async (key: string, value: string): Promise<void> => {
    // 古い分割が残ると getItem が壊れた値を返すため、先に消す
    await secureStorage.removeItem(key);
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_LENGTH) {
      chunks.push(value.slice(i, i + CHUNK_LENGTH));
    }
    await Promise.all(chunks.map((chunk, i) => SecureStore.setItemAsync(chunkKey(key, i), chunk)));
    await SecureStore.setItemAsync(countKey(key), String(chunks.length));
  },

  removeItem: async (key: string): Promise<void> => {
    const count = await readCount(key);
    await Promise.all(
      Array.from({ length: count }, (_, i) => SecureStore.deleteItemAsync(chunkKey(key, i))),
    );
    await SecureStore.deleteItemAsync(countKey(key));
  },
};

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    // URL からセッションを読むのはブラウザの機能。RN には URL が無いため無効にする。
    // 有効なままだと起動時に読み取りを試みて警告が出る。
    detectSessionInUrl: false,
  },
});

export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};
