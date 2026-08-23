import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Vite は既定でこの設定ファイルがある場所（apps/web）から .env を探すため、
  // リポジトリ直下の .env が読まれない。docker-compose も同じファイルを参照しており、
  // 環境変数の置き場所を 1 つに保つためルートを見に行かせる。
  envDir: fileURLToPath(new URL("../../", import.meta.url)),
  // ポートを固定する。塞がっていたときに黙って別のポートへ逃げると、
  // apps/desktop 用の 5174 を奪ってしまい、原因の分かりにくい失敗になる。
  server: { port: 5173, strictPort: true },
  plugins: [react(), tailwindcss()],
  resolve: {
    // shadcn/ui が生成するコードは @/ 始まりで import するため、src へ向けます。
    // tsconfig.json の paths と同じ内容を持たせる必要があります（Vite は tsconfig を読まない）。
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
