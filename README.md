# 超簡素な一言メモアプリ開発計画書 (MVP)

## 【概要】

pnpm Catalogs と Turborepo を用いたモノレポ構成で、インフラ（クラウド）からフロント（Web / モバイル / デスクトップ）、バックエンドまでを一気通貫で構築する。Hasura を中心とした GraphQL エコシステムと、NestJS による DDD/Clean Architecture の統合を 短期間で体験する。

## 【目的】

- モダンなモノレポ開発（pnpm / Turborepo / ESLint / Biome / pnpm Catalogs）のワークフローを習得する。
- Terraform のローカル品質管理（fmt, lint, plan, test）を実践する。
- 各レイヤー（フロント・バック・インフラ）の接続性を GraphQL を通じて理解する。
- アジャイル開発（スクラム）を体感する。

## 【技術スタック】

- **ソースコード管理**: Git / GitHub
  - **開発フロー**: GitHub Stacked PRs (`gh stack`)
- **パッケージ管理**: pnpm (Workspace / Catalogs)
- **ビルドツール**: Turborepo
- **静的解析**: ESLint (typescript-eslint の型認識ルール)
- **整形**: Biome (Formatter)
- **インフラ**: 無料枠の PaaS / Terraform (tffmt, tflint, terraform plan, terraform test)
  - 載せ先は Cloudflare Workers / Hasura Cloud / Supabase / Render（[Discussion #29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29)）
  - `infra/` は AWS 向けだったため [#99](https://github.com/Hitamuki/study-web-modern-stack/issues/99) で削除。[#100](https://github.com/Hitamuki/study-web-modern-stack/issues/100) で載せ先向けに作り直す
- **ミドルウェア**: Hasura (GraphQL Engine)
- **データベース**: PostgreSQL
- **バックエンド**: TypeScript / Node.js / NestJS
  - **アーキテクチャ**: DDD / Clean Architecture
- **フロントエンド**: TypeScript / React / Vite / GraphQL (Apollo Client)
  - **Web**: React
    - **アーキテクチャ**: FSD (Feature-Sliced Design)
    - **スタイリング**: Tailwind CSS v4 + shadcn/ui (Radix)
  - **モバイル**: React Native (Expo)
  - **デスクトップ**: Electron
- **開発スタイル**: アジャイル / セルフスクラム

## 開発フロー

### モノレポ基盤構築

- **GitHub & モノレポ環境構築**
  - ✅GitHub リポジトリの作成と初期 push
  - ✅エディターの拡張機能、設定
  - ✅mise,CONTRIBUTING.mdの整備
  - ✅`pnpm init` および `pnpm-workspace.yaml` (Catalogs) の作成（pnpm workspace）
  - ✅`turbo.json` の定義（build, lint, dev のパイプライン設定）
  - ✅`eslint.config.mjs`（lint）と `biome.jsonc`（整形）による全プロジェクト共通の設定

### インフラ準備

- **Terraform**（AWS 向けに実施済み。[#99](https://github.com/Hitamuki/study-web-modern-stack/issues/99) で `infra/` ごと削除し、[#100](https://github.com/Hitamuki/study-web-modern-stack/issues/100) で無料枠プラットフォーム向けに作り直す）
  - ✅`main.tf` への基本リソース（VPC/RDS）定義
  - ✅`terraform fmt` による自動整形
  - ✅`terraform validate` による構文チェック
  - ✅`tflint` による静的解析の実行
  - ✅`terraform plan` による実行計画の確認
  - ✅`terraform test` による変数・バリデーションの簡易テスト実装
  - ✅`terraform-docs` による自動ドキュメント生成

### バックエンドロジック & Hasura 連携

- **Hasura & GraphQL 入門**
  - ✅GraphQL の 3 要素（Query, Mutation, Subscription）の概念把握
  - ✅Docker Compose による PostgreSQL / Hasura の起動
    - Hasura コンソール: `http://localhost:8080`
  - ✅Hasura コンソールでの `memos` テーブル作成と CRUD 操作の試行
- **NestJS によるバックエンド構築**
  - ✅NestJS プロジェクトの初期化と DDD 構成のディレクトリ作成
  - ✅デバッグ設定
  - ✅Domain 層：`Memo` エンティティとバリデーションロジックの実装
  - ✅UseCase 層：メモ登録のビジネスロジック実装
  - ✅Infrastructure 層：外部公開用コントローラーの実装
- **Hasura Actions 連携**
  - ✅Hasura の Mutation 実行時に NestJS のエンドポイントを叩く Action 設定
  - ✅「Hasura（受付）→ NestJS（ロジック）→ DB（Prisma）」のデータフロー構築
  - ✅HasuraでNestJSのAPIを実行
- **コンテナ化**
  - ✅`apps/api/Dockerfile`（マルチステージ / pnpm workspace + Catalogs + Prisma 対応）
  - ✅死活監視用の `GET /health`（DB まで到達する。`ok` / `ng` だけを返す）

### アジャイル開発体験

- **アジャイル・プラクティス**
  - ✅GitHub Projects (Kanban) によるタスク管理の体験
  - ✅セルフスクラム（昨日の振り返りと今日のデモ）

### Web実装

- **React 実装 (FSD アーキテクチャ)**
  - ✅Vite による React プロジェクトの起立
  - FSD 構成（`shared`, `entities`, `features`, `pages`）のディレクトリ作成
  - ✅Apollo Client を用いた Hasura への接続とデータ表示の実装

### モバイル実装

- **React Native (Expo) 実装**
  - ✅モバイル用プロジェクトの作成
  - ✅Apollo Client を用いた Hasura への接続とデータ表示の実装

### デスクトップ実装

- **Electron実装**
  - ✅デスクトップ用プロジェクトの作成
  - ✅Apollo Client を用いた Hasura への接続とデータ表示の実装

### 最終統合

- `turbo dev` を利用した全サービスの一括起動確認
- ESLint によるプロジェクト全体の静的解析パスの確認
- Vitestによる単体テストコードの実装
- スプリントレビュー（技術的負債と学びの整理）

### おまけ

- Hasuraによる認可
- Terraformのモジュール設計、ベストプラクティス
  - ディレクトリ構造
  - 変数管理
- 無料枠のサービスへデプロイ、GUI上でリソースや設定の確認（[Discussion #29](https://github.com/Hitamuki/study-web-modern-stack/discussions/29)）
- draw.io MCPサーバーを利用して、インフラ構成図を作成
- GitHub ActionsでCI/CD
- VitestでTDD
- PlaywrightでE2Eテスト
- スタイリングの共通化（Web, デスクトップ）
  - Web 側は導入済み（Discussion #47 / Issue #61）。デスクトップは開発再開時に同じ構成を持ち込む
- FigmaでUI設計
- docsにmdファイルで設計書を生成
- ロギングのtrace_idを活用した分散トレーシングで、運用時追跡可能にする
- request_idを活用した冪等性の確保
- 認証

## 【成功の定義（Doneの定義）】

1. GitHub にコードが管理され、ESLint の解析をパスしていること
2. Terraform で `plan` が通り、`test` が成功すること
   - **[#99](https://github.com/Hitamuki/study-web-modern-stack/issues/99) で `infra/` を削除したため、一時的に満たせない。**[#100](https://github.com/Hitamuki/study-web-modern-stack/issues/100) で回復する
3. Hasura Actions を経由して NestJS のドメインロジックが実行されること
4. フロントエンド（Web、モバイル、デスクトップ）から、同一の GraphQL API を通じてメモが表示・投稿できること
5. 無料枠のサービスで常設稼働すること
