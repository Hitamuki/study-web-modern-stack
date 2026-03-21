# Hasura 設定管理

## 概要
このディレクトリは Hasura のメタデータ（リレーション、権限設定、アクションなど）を管理するためのプロジェクトです。

## 役割分担
このプロジェクトでは、DB の構造と API レイヤーの役割を以下のように明確に分担しています。

- **Prisma (`apps/api/prisma`)**: 
  - データベースの構造（テーブル、カラム、インデックスなど）の作成・変更。
  - マイグレーションの実行。
  - 初期データ（Seed）の投入。
- **Hasura (`hasura/`)**:
  - API レイヤー（リレーション、権限、アクション、リモートスキーマなど）の設定。
  - GraphQL エンドポイントの提供。

## 構成
- `config.yaml`: Hasura CLI の設定ファイル（エンドポイントやディレクトリ構成を定義）。
- `metadata/`: Hasura コンソール上の設定が YAML 形式で保存されるディレクトリ。

## Hasura Actions (NestJS 連携) について
複雑なビジネスロジックや DB への保存処理などを NestJS で実装し、それを Hasura の Mutation として公開する場合の仕組みです。

### 基本原則
- **Hasura は NestJS のコードを自動で読み込みません。**
- 「どの Mutation がどの URL に飛ぶか」は **Hasura のメタデータ** で定義します。
- NestJS 側は「Hasura から呼ばれる Webhook (POST エンドポイント)」を実装します。

### 通信設定（Handler URL）
Hasura は Docker コンテナ内で動作するため、ホストマシンで動く NestJS を参照するには以下の URL を使用します。
- **Action Handler URL**: `http://host.docker.internal:3000/hasura/actions/[Action名]`

### 新しい Action を追加する手順
1. **NestJS で Webhook を実装する**:
   - `apps/api` 内に新しいエンドポイントを作成し、処理を実装します。
2. **Hasura で Action を定義する**:
   - `hasura console --project hasura` でコンソールを起動。
   - **Actions** タブで、GraphQL の型定義と `Handler URL` (例: `http://host.docker.internal:3000/hasura/actions/[新規Action名]`) を入力して作成。
3. **メタデータを保存する**:
   - ターミナルで `hasura metadata export --project hasura` を実行し、定義をファイルに書き出します。
4. **型定義を生成する**:
   - `pnpm --filter @repo/graphql codegen` を実行し、フロントエンドで新しい Action を型安全に呼べるようにします。

### データフロー
1. クライアント → Mutation (Hasura 受付)
2. Hasura → Webhook POST (NestJS 呼び出し)
3. NestJS → Prisma を通じて DB 保存・ロジック実行
4. NestJS → レスポンスを Hasura へ返却
5. Hasura → クライアントへ最終レスポンス

## 主要コマンド

`hasura` コマンドを使用する際は、`hasura/` ディレクトリの設定ファイルを読み込むために `--project hasura` オプションを付加して実行してください。

### 1. メタデータの操作（設定の保存・同期）
```bash
# Hasura コンソールで行った変更をローカルファイルに書き出す
# ※コンソールで設定を変更した後は、必ずこのコマンドを実行して Git 管理下に保存してください。
hasura metadata export --project hasura

# ローカルファイルを Hasura サーバーに適用する
# ※他の開発者の変更を自分の環境に反映させる場合などに使用します。
hasura metadata apply --project hasura

# Hasura のメタデータを最新の状態にリフレッシュする（再読み込み）
# ※DB（Prisma）側で変更があったが Hasura 側に反映されていない場合などに使用します。
hasura metadata reload --project hasura
```

### 2. インターフェースの起動
```bash
# Hasura コンソールを起動する
# ※このコマンドで起動したコンソール上で行った変更は、メタデータの更新として追跡しやすくなります。
hasura console --project hasura
```

### 3. 型定義の生成（GraphQL Codegen）
型生成は `packages/graphql` で一括管理されています。
```bash
# 全アプリ共通の GraphQL 型定義と gql 関数を一括生成・更新します。
# ※Hasura の設定やクエリを変更した後に実行してください。
pnpm --filter @repo/graphql codegen
```
