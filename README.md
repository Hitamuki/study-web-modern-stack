# 超簡素な一言メモ共有アプリ開発計画書 (4-Day MVP)

## 【概要】

pnpm Catalogs と Turborepo を用いたモノレポ構成で、インフラからフロント/モバイルまでを一気通貫で構築する。Hasura を中心とした GraphQL エコシステムと、NestJS による DDD/Clean Architecture の統合を 4 日間で体験する。

## 【目的】

- モダンなモノレポ開発（pnpm / Turborepo / Biome / pnpm Catalogs）のワークフローを習得する。
- Terraform のローカル品質管理（fmt, lint, plan, test）を実践する。
- 各レイヤー（フロント・バック・インフラ）の接続性を GraphQL を通じて理解する。

## 【技術スタック】

- **ソースコード管理**: Git / GitHub
- **パッケージ管理**: pnpm (Workspace / Catalogs)
- **ビルドツール**: Turborepo
- **静的解析/整形**: Biome (Linter / Formatter)
- **インフラ**: AWS / Terraform (tffmt, tflint, terraform plan, terraform test)
- **ミドルウェア**: Hasura (GraphQL Engine)
- **データベース**: PostgreSQL
- **バックエンド**: TypeScript / Node.js / NestJS
  - **アーキテクチャ**: DDD / Clean Architecture
- **フロントエンド**: TypeScript / React / Vite / GraphQL (Apollo Client)
  - **アーキテクチャ**: FSD (Feature-Sliced Design)
- **モバイル**: React Native (Expo)
- **開発スタイル**: アジャイル / セルフスクラム

## 【スケジュール】

### ■ 1日目：モノレポ基盤・インフラ・Hasura入門

- **GitHub & モノレポ環境構築**
  - ✅GitHub リポジトリの作成と初期 push
  - ✅エディターの拡張機能、設定
  - ✅mise,CONTRIBUTING.mdの整備
  - ✅`pnpm init` および `pnpm-workspace.yaml` (Catalogs) の作成（pnpm workspace）
  - ✅`turbo.json` の定義（build, lint, dev のパイプライン設定）
  - ✅`biome.json` による全プロジェクト共通の静的解析設定
- **Terraform**
  - ✅`main.tf` への基本リソース（VPC/RDS）定義
  - ✅`terraform fmt` による自動整形
  - ✅`terraform validate` による構文チェック
  - ✅`tflint` による静的解析の実行
  - ✅`terraform plan` による実行計画の確認
  - ✅`terraform test` による変数・バリデーションの簡易テスト実装
  - ✅`terraform-docs` による自動ドキュメント生成
- **Hasura & GraphQL 入門**
  - ✅GraphQL の 3 要素（Query, Mutation, Subscription）の概念把握
  - ✅Docker Compose による PostgreSQL / Hasura の起動
    - Hasura コンソール: `http://localhost:8080`
  - ✅Hasura コンソールでの `memos` テーブル作成と CRUD 操作の試行

### ■ 2日目：バックエンドロジック & Hasura 連携

- **NestJS によるバックエンド構築**
  - ✅NestJS プロジェクトの初期化と DDD 構成のディレクトリ作成
  - ✅デバッグ設定
  - ✅Domain 層：`Memo` エンティティとバリデーションロジックの実装
  - ✅UseCase 層：メモ登録のビジネスロジック実装
  - ✅Infrastructure 層：外部公開用コントローラーの実装
- **Hasura Actions 連携**
  - ✅Hasura の Mutation 実行時に NestJS のエンドポイントを叩く Action 設定
  - ✅「Hasura（受付）→ NestJS（ロジック）→ DB（Prisma）」のデータフロー構築
  - ✅セットアップ手順: [docs/hasura-actions-setup.md](docs/hasura-actions-setup.md)
  - ✅HasuraでNestJSのAPIを実行
- **アジャイル・プラクティス**
  - ✅GitHub Projects (Kanban) によるタスク管理の体験
  - ✅セルフスクラム（昨日の振り返りと今日のデモ）

### ■ 3日目：フロントエンド・モバイル実装

- **React 実装 (FSD アーキテクチャ)**
  - ✅Vite による React プロジェクトの起立
  - FSD 構成（`shared`, `entities`, `features`, `pages`）のディレクトリ作成
  - ✅Apollo Client を用いた Hasura への接続とデータ表示の実装
- **最終統合とクリーンアップ**
  - `turbo dev` を利用した全サービスの一括起動確認
  - Biome によるプロジェクト全体の静的解析パスの確認
  - 3日間のスプリントレビュー（技術的負債と学びの整理）

### ■ 4日目：モバイル実装

- **React Native (Expo) 実装**
  - モバイル用プロジェクトの作成
  - Web 側で作成した GraphQL Query/Mutation の流用と UI 実装
- **最終統合とクリーンアップ**
  - `turbo dev` を利用した全サービスの一括起動確認
  - Biome によるプロジェクト全体の静的解析パスの確認
  - 4日間のスプリントレビュー（技術的負債と学びの整理）

### おまけ

- Hasuraによる認可
- Terraformのモジュール設計、ベストプラクティス
  - ディレクトリ構造
  - 変数管理
- AWSへデプロイ、GUI上でリソースや設定の確認
- draw.io MCPサーバーを利用して、AWSインフラ構成図を作成
- AWS コスト試算 & 設計調査
  - AWS Pricing Calculator: VPC, RDS, ECS(Fargate) 等の月額コストを算出・比較
  - AWS Well-Architected Framework: 「コスト最適化」「信頼性」の柱を中心に、今回の構成におけるベストプラクティスを抽出
- GitHub ActionsでCI/CD
- VitestでTDD
- PlaywrightでE2Eテスト
- docsにmdファイルで設計書を生成
- 認証

## 【成功の定義（Doneの定義）】

1. GitHub にコードが管理され、Biome の解析をパスしていること。
2. Terraform で `plan` が通り、`test` が成功すること。
3. Hasura Actions を経由して NestJS のドメインロジックが実行されること。
4. React/React Native の両方から、同一の GraphQL API を通じてメモが表示・投稿できること。
