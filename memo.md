# 開発メモ: 1日目 (モノレポ基盤構築)

スケジュール1日目の「GitHub & モノレポ環境構築」セクションで実施した内容のまとめです。

## 完了項目の概要

| 項目                                                       | 概要                        | 技術的な知見・詳細                                                                                                |
| :--------------------------------------------------------- | :-------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **GitHub リポジトリ作成 & 初期 push**                      | プロジェクトの Git 管理開始 | `main` ブランチへの初期コミットとリモート連携を完了。                                                             |
| **エディターの拡張機能、設定**                             | 開発体験 (DX) の向上        | `.vscode/settings.json` での自動整形設定や推奨拡張機能を整備し、チーム開発での環境差異を低減。                    |
| **mise & CONTRIBUTING.md の整備**                          | ランタイム・貢献フロー管理  | `mise` を活用し Node.js (v24) や pnpm のバージョンをプロジェクト単位で固定。                                      |
| **pnpm Workspace (Catalogs) の導入**                       | 依存関係の一元管理          | `pnpm-workspace.yaml` の `catalogs` 機能を活用し、複数パッケージ間で共通ライブラリのバージョンを同期。            |
| **Turborepo による実行パイプライン定義**                   | ビルド・タスクの効率化      | `turbo.json` に `build`, `lint`, `dev`, `test` を定義。パッケージ間の依存関係を考慮した高速なタスク実行を可能に。 |
| **Biome による静的解析の統合**                             | 高速な Lint/Format          | `biome.json` により Linter と Formatter を統合。ESLint/Prettier よりも高速な解析を実現。                          |
| **Terraform によるインフラ構成管理**                       | AWS リソースのコード化      | `main.tf` で VPC, Subnet, RDS 等のインフラを定義。`main.tftest.hcl` で設定検証テストを実装。                      |
| **GraphQL の 3 要素概念把握**                              | GraphQL 基礎理解            | Query（取得）、Mutation（変更）、Subscription（リアルタイム）の役割を学習。REST API との違いを把握。              |
| **Docker Compose による PostgreSQL / Hasura の起動**       | ローカル開発環境構築        | `docker-compose.yml` で PostgreSQL と Hasura を定義。ポートマッピングと環境変数設定によりローカル起動を実現。     |
| **Hasura コンソールでの `memos` テーブル作成と CRUD 操作** | GraphQL API の実践操作      | Hasura コンソールでテーブル作成、GraphiQL で Query/Mutation を実行。自動生成された GraphQL スキーマの確認。       |

## 主要な知見

### 1. pnpm Catalogs による依存関係管理

pnpm 9.5+ から導入された Catalogs 機能を利用することで、モノレポ内の複数の `package.json` で同じライブラリ（TypeScript, Biome 等）のバージョンを同期させることが容易になりました。これにより、「一部のパッケージだけバージョンが古い」といった事態を防げます。

### 2. mise によるツールチェーンの固定

`.mise.toml` を配置することで、開発者が個別にランタイムをインストールする手間を省き、チーム全体で同じ Node.js やパッケージマネージャーのバージョンを使用することを保証しました。

### 3. Biome への移行

Linter と Formatter を Biome に一本化することで、設定ファイルの簡素化と、Prettier 等に比べて劇的な速度向上を確認しました。

### 4. Turborepo のパイプライン設計

`dependsOn: ["^build"]` などの定義により、依存するパッケージがビルド済みでないと実行されない等の依存関係を正しく表現しました。

### 5. Terraform によるインフラ as Code

Terraform を用いて AWS リソース（VPC, Subnet, Internet Gateway, Security Group, RDS）をコード化し、インフラの再現性とバージョン管理を実現。Terraform Test を導入し、plan 出力の検証により設定ミスを早期に検知可能にしました。

### 6. infraディレクトリ内での Terraform 操作
`infra/` フォルダ内で以下の手順で Terraform を実行します。

- 初回、またはプロバイダー/モジュール更新時:
  - `cd infra && terraform init`
- フォーマット/検証:
  - `terraform fmt -recursive`
  - `terraform validate`
- 変更確認:
  - `terraform plan -var-file=terraform.tfvars`
- 適用:
  - `terraform apply -var-file=terraform.tfvars` (または `-auto-approve` 付きで自動承認)
- 削除（破壊的操作）:
  - `terraform destroy -var-file=terraform.tfvars` (本番実行時は特に注意)
- テスト:
  - `terraform test` で `main.tftest.hcl` に定義した検証シナリオを実行

`terraform.tfvars` には `db_password` などの機密値を定義しています。環境変数 `TF_VAR_db_password` を使って上書きすることも可能です。

### 7. Hasura による GraphQL API の自動生成

Hasura を PostgreSQL に接続することで、データベーススキーマから自動的に GraphQL API を生成できることを確認。コンソール上でテーブルを作成するだけで Query/Mutation が利用可能になり、開発効率が大幅に向上。

### 8. Docker Compose によるローカル開発環境の簡易構築

`docker-compose.yml` を用いて PostgreSQL と Hasura を一括起動。コンテナ間ネットワークにより Hasura が Postgres に接続可能。ホストポートの競合を避けるため、5433:5432 のマッピングを実施。

### 9. Hasura コンソールの操作体験

コンソール内でテーブル作成、権限設定、GraphiQL でのクエリ実行が可能。CRUD 操作を通じて GraphQL の直感的な操作性を体感。自動生成されたスキーマがリアルタイムで反映される点が便利。

### 10. Hasura と NestJS の役割分担

Hasura と NestJS を組み合わせるアーキテクチャにおける、基本的な役割分担の方針を確認しました。

- **Hasura**: 「データの読み書き（CRUD）と権限管理」を担当。
  - データベースの操作を自動化し、RBAC (Role-Based Access Control) などのセキュリティ設定を担う。
- **NestJS**: 「ビジネスロジックと外部連携」を担当。
  - 複雑な計算、ドメイン固有のバリデーション、メール送信などの外部 API 連携を実装する。
  - Hasura Actions (同期処理) や Event Triggers (非同期処理) を通じて利用される。
