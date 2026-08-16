import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // shadcn/ui が生成するコードは @/ 始まりで import するため、src へ向けます。
    // tsconfig.json の paths と同じ内容を持たせる必要があります（Vite は tsconfig を読まない）。
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
