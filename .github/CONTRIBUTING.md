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

| コマンド           | 内容                    |
| :----------------- | :---------------------- |
| `mise run install` | 依存関係のインストール  |
| `mise run dev`     | 開発サーバーの起動      |
| `mise run build`   | プロジェクトのビルド    |
| `mise run lint`    | 静的解析 (Biome) の実行 |
| `mise run format`  | コードの自動整形        |
| `mise run test`    | テストの実行            |

### Stacked PRs 関連コマンド

`mise run stack:setup` で `gh stack` 拡張を導入したあとは、`gh` で直接操作します。

| コマンド               | 内容                                        |
| :--------------------- | :------------------------------------------ |
| `mise run stack:setup` | `gh stack` 拡張とエージェント用スキルの導入 |
| `gh stack init <名>`   | 新しいスタックを開始                        |
| `gh stack add <名>`    | 最上段に新しい層を積む                      |
| `gh stack view`        | スタックの状態を表示                        |
| `gh stack submit`      | push + PR 作成 + GitHub 上で Stack 化       |
| `gh stack sync`        | `main` の変更を取り込みスタック全体を同期   |
| `gh stack merge`       | スタックをまとめてマージ                    |

詳細は [Stacked PRs 運用ガイド](./STACKED_PRS.md) を参照してください。

## infra/ での Terraform 操作

infra ディレクトリ配下で以下のコマンドを実行します。

```bash
# infra ディレクトリに移動
cd infra

# プロバイダーやバックエンド設定を初期化
terraform init

# フォーマット (再帰的に全ファイル)
terraform fmt -recursive

# 設定の静的検証
terraform validate

# 変更内容のプランを確認
terraform plan -var-file=terraform.tfvars

# 変更を適用
terraform apply -var-file=terraform.tfvars

# 破棄（リソース削除）
terraform destroy -var-file=terraform.tfvars

# テスト（main.tftest.hcl）を実行
terraform test
```

`terraform.tfvars` には `db_password` などの機密値が記載されているため、必要に応じて `TF_VAR_db_password` で上書きしてください。

## 開発フロー

本リポジトリでは GitHub の **Stacked PRs**（積み上げ式プルリクエスト）で開発します。
大きな変更を小さな PR に分割し、前の PR を親（ベースブランチ）にして積み上げることで、レビュー単位を小さく保ちます。

### 単独の変更の場合

1. `gh stack init <ブランチ名>` で `main` から機能ブランチを作成します。
2. 変更を加えてコミットします。
3. `mise run lint` および `mise run format` を実行してコード品質を確認します。
4. `gh stack submit` でプルリクエストを作成します。

### 変更を積み上げる場合（Stacked PRs）

1. `gh stack init <ブランチ名>` で 1 層目のブランチを作成し、コミットします。
2. `gh stack add <ブランチ名>` で次の層を積み、コミットします（必要な数だけ繰り返す）。
3. `gh stack view` でスタック構造を確認します。
4. `gh stack submit` で全 PR をまとめて作成し、GitHub 上で Stack として紐付けます。
5. `main` が進んだら `gh stack sync` でスタック全体を追従させます。
6. `gh stack merge` でスタックをまとめてマージし、`gh stack sync --prune` で後片付けします。

2 層以上のスタックでは、GitHub の Merge ボタンや `gh pr merge` による個別マージはスタックの整合性が崩れるため使いません。
1 層だけのスタックは `gh stack merge` が使えないため、`gh pr merge <番号> --rebase --delete-branch` でマージします。
分割の粒度やコンフリクト時の対処など、詳しい手順は [Stacked PRs 運用ガイド](./STACKED_PRS.md) を参照してください。
