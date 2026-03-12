# 開発への参加方法

プロジェクトの開発を始めるための手順ガイドです。

## 開発環境の準備

このプロジェクトではツールの管理とタスクの実行に [mise](https://mise.jdx.dev/) を推奨しています。

### 必要ツール

- [mise](https://mise.jdx.dev/)
- [pnpm](https://pnpm.io/) (miseで管理可能です)

## はじめかた

### 1. リポジトリをクローンする

```bash
git clone <repository-url>
cd study-web-modern-stack
```

### 2. ツールと依存関係のセットアップ

miseを使用している場合：
```bash
mise run install
```

miseを使用していない場合：
```bash
pnpm install
```

### 3. 開発サーバーの起動

```bash
mise run dev
```

## 主要なコマンド

| コマンド | 内容 |
| :--- | :--- |
| `mise run install` | 依存関係のインストール |
| `mise run dev` | 開発サーバーの起動 |
| `mise run build` | プロジェクトのビルド |
| `mise run lint` | 静的解析 (Biome) の実行 |
| `mise run format` | コードの自動整形 |
| `mise run test` | テストの実行 |

## 開発フロー

1. `main` ブランチから機能ブランチを作成します。
2. 変更を加えます。
3. `pnpm lint` および `pnpm format` を実行してコード品質を確認します。
4. プルリクエストを作成します。
