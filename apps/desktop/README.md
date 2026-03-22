# desktop

Electron + React + electron-vite によるデスクトップアプリ

## 概要

| 項目           | 内容                         |
| -------------- | ---------------------------- |
| フレームワーク | Electron                     |
| レンダラー     | React + Vite (electron-vite) |
| ビルドツール   | electron-vite                |

### ディレクトリ構成

```
src/
├── main/       # Electronメインプロセス
├── preload/    # プリロードスクリプト（IPC橋渡し）
└── renderer/   # Reactアプリ（レンダラープロセス）
```

## 起動方法

```bash
# 依存関係インストール（モノレポルートで）
pnpm install

# 開発サーバー起動
pnpm --filter desktop dev
# または turbo dev（全サービス一括起動）
turbo dev
```

## ビルド

```bash
pnpm --filter desktop build
# 出力先: dist/main, dist/preload, dist/renderer
```

## デスクトップアプリとして確認する

ビルド後に Electron でそのまま起動する方法。

```bash
# 1. ビルド
pnpm --filter desktop build

# 2. Electron で起動
pnpm --filter desktop start
```

`pnpm start` は `electron .` を実行し、`dist/main/index.js` をエントリーポイントとしてアプリウィンドウを開く。
開発サーバー（`dev`）と異なり、ホットリロードはなく静的ビルド成果物が使われる。

## デバッグ方法

### レンダラープロセス（React）

開発中は Chromium DevTools が使用可能。

```
Ctrl+Shift+I（Windows/Linux）/ Cmd+Option+I（macOS）
```

### メインプロセス（Node.js）

electron-vite の開発モードでは、メインプロセスのソースマップが有効になっている。
VS Code でデバッグする場合は以下の `launch.json` 設定を追加する。

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Electron Main",
  "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
  "args": [".", "--inspect=5858"],
  "cwd": "${workspaceFolder}/apps/desktop"
}
```

## 注意事項

- `src/preload/index.ts` でメインプロセスとレンダラー間の IPC を定義する。レンダラーから Node.js API を直接呼び出さないこと（`contextIsolation` のベストプラクティス）。
- `package.json` の `"main": "dist/main/index.js"` はビルド後のパスを指しているため、`pnpm start` はビルド後に実行すること。
- macOS では `window-all-closed` でアプリを終了しない（Dock からの再起動に対応するため）。
