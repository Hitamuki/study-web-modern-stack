/**
 * 実行時の設定値。
 *
 * Vite は `VITE_` 接頭辞の環境変数だけをクライアントへ埋め込む。
 * 既定値はローカルの docker-compose を指す（`.env.example` を参照）。
 */
export const GRAPHQL_URL: string =
  import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:8080/v1/graphql";
