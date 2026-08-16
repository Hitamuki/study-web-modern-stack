import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: { outDir: "dist/main", sourcemap: true },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: { outDir: "dist/preload" },
  },
  renderer: {
    root: resolve("src/renderer"),
    build: { outDir: "dist/renderer" },
    // apps/web の Vite が既定の 5173 を使うため、ずらして固定します。
    // make frontend-start で両方を同時に起動しても取り合いになりません。
    server: { port: 5174 },
    plugins: [react()],
  },
});
