/**
 * 実行時の設定値。
 *
 * electron-vite の renderer も Vite なので `VITE_` 接頭辞のみ埋め込まれる。
 * `envDir` をリポジトリ直下に向けてあるため、`apps/web` と同じ `.env` を読む。
 */
/**
 * Hasura の GraphQL エンドポイント。
 *
 * **localhost のフォールバックを置かない。** ビルド時に埋め込まれるため、
 * 未設定のまま作った成果物は実行するまで気づけない（#89）。
 *
 * なお `index.html` の CSP（`connect-src`）にはまだ `http://localhost:8080` が
 * 残っている。デスクトップはデプロイ対象外のため、公開する段になったら直す。
 */
export const GRAPHQL_URL: string = requireEnv(import.meta.env.VITE_GRAPHQL_URL, "VITE_GRAPHQL_URL");

function requireEnv(value: string | undefined, name: string): string {
  if (value === undefined || value === "") {
    throw new Error(`${name} が未設定です。.env を確認してください（.env.example を参照）。`);
  }
  return value;
}

export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? "";

/** publishable key（公開前提の値）。service_role キーは絶対に置かない */
export const SUPABASE_PUBLISHABLE_KEY: string = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

/** パスワード再設定の案内先。デスクトップからは Web へ誘導する */
export const WEB_APP_URL: string = import.meta.env.VITE_WEB_APP_URL ?? "http://localhost:5173";
