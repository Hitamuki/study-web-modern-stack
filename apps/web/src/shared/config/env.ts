/**
 * 実行時の設定値。
 *
 * Vite は `VITE_` 接頭辞の環境変数だけをクライアントへ埋め込む。
 * ここに秘匿値を置かない（ビルド成果物に含まれ、ブラウザから読める）。
 */
/**
 * Hasura の GraphQL エンドポイント。
 *
 * **localhost のフォールバックを置かない。** ビルド時に埋め込まれる値なので、
 * 未設定のまま本番ビルドを作ると「動くが誰も繋がらない成果物」ができ、
 * 実行して初めて気づくことになる（#89）。ここで落として気づけるようにする。
 * ローカルは `.env` の `VITE_GRAPHQL_URL` を読む（`.env.example` 参照）。
 */
export const GRAPHQL_URL: string = requireEnv(import.meta.env.VITE_GRAPHQL_URL, "VITE_GRAPHQL_URL");

function requireEnv(value: string | undefined, name: string): string {
  if (value === undefined || value === "") {
    throw new Error(`${name} が未設定です。.env を確認してください（.env.example を参照）。`);
  }
  return value;
}

/** Supabase プロジェクトの URL。Reference ID から組み立てる */
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? "";

/**
 * publishable key（旧 anon key）。**公開前提の値**なのでクライアントに載せてよい。
 * service_role キーは絶対にここへ置かない（全権を持つため）。
 */
export const SUPABASE_PUBLISHABLE_KEY: string = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
