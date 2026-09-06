import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * 型生成は Hasura のスキーマを admin 権限で読む。値は `make codegen` が .env から渡す。
 *
 * **既定値を持たせない。** 以前は平文の admin secret をフォールバックにしていたが、
 * リポジトリは public であり、値がそのまま残ると本番の設定漏れに気づけない（#89）。
 */
const adminSecret = process.env.HASURA_GRAPHQL_ADMIN_SECRET;
if (adminSecret === undefined || adminSecret === "") {
  throw new Error(
    "HASURA_GRAPHQL_ADMIN_SECRET が未設定です。make codegen から実行するか、.env を読み込んでください。",
  );
}

// CLI と同じ環境変数名に揃える。未設定ならローカルの Hasura を見る。
const endpoint = process.env.HASURA_GRAPHQL_ENDPOINT ?? "http://localhost:8080";

const config: CodegenConfig = {
  schema: {
    [`${endpoint}/v1/graphql`]: {
      headers: {
        "x-hasura-admin-secret": adminSecret,
      },
    },
  },
  // Scan all apps and packages for documents
  documents: ["../../apps/*/src/**/*.{ts,tsx}", "../../packages/*/src/**/*.{ts,tsx}"],
  generates: {
    "./src/generated/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
