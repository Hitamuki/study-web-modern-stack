/**
 * 実行時の設定値。
 *
 * electron-vite の renderer も Vite なので `VITE_` 接頭辞のみ埋め込まれる。
 * `envDir` をリポジトリ直下に向けてあるため、`apps/web` と同じ `.env` を読む。
 */
export const GRAPHQL_URL: string =
  import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:8080/v1/graphql";

export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? "";

/** publishable key（公開前提の値）。service_role キーは絶対に置かない */
export const SUPABASE_PUBLISHABLE_KEY: string = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

/** パスワード再設定の案内先。デスクトップからは Web へ誘導する */
export const WEB_APP_URL: string = import.meta.env.VITE_WEB_APP_URL ?? "http://localhost:5173";
