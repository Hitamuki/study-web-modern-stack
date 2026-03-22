import { resolve } from "path";
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
    plugins: [react()],
  },
});
