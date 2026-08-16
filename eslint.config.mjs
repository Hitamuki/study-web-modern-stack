// @ts-check
import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

// 走査範囲は .gitignore を正本にします（AGENTS.md / 旧 biome.jsonc と同じ方針）。
// 生成物のうち Git 管理下にあるものだけを、下の ignores で個別に足しています。
const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

// turbo lint は各パッケージのディレクトリで eslint を起動しますが、flat config の
// files / ignores はこのファイルの位置（リポジトリルート）を基準に解決されます。
export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  {
    name: "repo/ignores",
    ignores: [
      // GraphQL Code Generator の出力
      "**/src/generated/**",
      // Hasura CLI（metadata export）が書き出すファイル
      "hasura/metadata/**",
    ],
  },

  {
    name: "repo/base",
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },

  // 型情報を使うルール。Discussion #40 で ESLint を選んだ主な理由がこれなので、
  // 素の recommended ではなく recommendedTypeChecked を土台にします。
  {
    name: "repo/typescript",
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 設定ファイル（このファイル自身など）は tsconfig の include の外にあるため型情報を切ります。
  {
    name: "repo/config-files",
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    name: "repo/node",
    files: [
      "apps/api/**/*.ts",
      "packages/graphql/**/*.ts",
      "apps/desktop/src/main/**/*.ts",
      "apps/desktop/src/preload/**/*.ts",
      "apps/desktop/electron.vite.config.ts",
      "apps/web/vite.config.ts",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    name: "repo/browser",
    files: ["apps/web/src/**/*.{ts,tsx}", "apps/desktop/src/renderer/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
  },

  {
    name: "repo/react-native",
    files: ["apps/mobile/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // React を使う 3 アプリ共通。フックの規則は描画の正しさに直結するため全アプリに効かせます。
  {
    name: "repo/react-hooks",
    files: ["apps/web/src/**/*.tsx", "apps/desktop/src/renderer/**/*.tsx", "apps/mobile/**/*.tsx"],
    // configs.recommended は eslintrc 形式なので、flat config 版を使います
    extends: [reactHooks.configs.flat["recommended-latest"]],
  },

  // Fast Refresh は Vite（web / desktop）のみ。apps/mobile は Metro なので対象外です。
  {
    name: "repo/react-refresh",
    files: ["apps/web/src/**/*.tsx", "apps/desktop/src/renderer/**/*.tsx"],
    extends: [reactRefresh.configs.vite],
  },

  // NestJS は @Body() などのパラメータデコレータを使うため、未使用に見える引数が出ます。
  // また DI コンテナが実行時に解決するため、コンストラクタ引数も同様です。
  {
    name: "repo/nestjs",
    files: ["apps/api/**/*.ts"],
    rules: {
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
);
