/**
 * Expo がクライアントへ埋め込む環境変数の型。
 * `EXPO_PUBLIC_` 接頭辞のものだけがバンドルに含まれる。
 * これが無いと `process.env.X` が any になり、@typescript-eslint に弾かれる。
 */
declare namespace NodeJS {
  interface ProcessEnv {
    /** Hasura の GraphQL エンドポイント。実機から繋ぐ場合は PC の IP を指定する */
    readonly EXPO_PUBLIC_GRAPHQL_URL?: string;
  }
}
