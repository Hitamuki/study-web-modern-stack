/// <reference types="vite/client" />

/**
 * Vite がクライアントへ埋め込む環境変数の型。
 * これが無いと `import.meta.env.X` が any になり、@typescript-eslint に弾かれる。
 */
interface ImportMetaEnv {
  /** Hasura の GraphQL エンドポイント。未設定ならローカルの docker-compose を指す */
  readonly VITE_GRAPHQL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
