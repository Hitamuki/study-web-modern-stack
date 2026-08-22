/**
 * 実行時の設定値。
 *
 * Vite は `VITE_` 接頭辞の環境変数だけをクライアントへ埋め込む。
 * ここに秘匿値を置かない（ビルド成果物に含まれ、ブラウザから読める）。
 */
export const GRAPHQL_URL: string =
  import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:8080/v1/graphql";

/** Supabase プロジェクトの URL。Reference ID から組み立てる */
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? "";

/**
 * publishable key（旧 anon key）。**公開前提の値**なのでクライアントに載せてよい。
 * service_role キーは絶対にここへ置かない（全権を持つため）。
 */
export const SUPABASE_PUBLISHABLE_KEY: string = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
