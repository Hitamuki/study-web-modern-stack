# Hasura Actions 連携セットアップ

「Hasura（受付）→ NestJS（ロジック）→ DB（Prisma 経由）」のデータフローを構築するための手順です。

## Hasura Actions の仕組み（自動生成される？）

**Hasura は NestJS のコードを読んで Action を自動生成しません。**

- **Hasura 側**: 「どの Mutation/Query がどの URL に飛ぶか」は **Hasura のメタデータ** で管理される。Action 名・引数・戻り値の型・Handler URL はすべてメタデータに手で定義する必要がある。
- **NestJS 側**: あくまで「Hasura から呼ばれる Webhook」を実装するだけ。Hasura は NestJS をイントロスペクトしない。

つまり **「Action の定義」は Hasura が持っていて、「その実装」が NestJS にある** という分担です。

| 役割 | 担当 | 内容 |
|------|------|------|
| GraphQL スキーマ（createMemo の型など） | Hasura メタデータ | ここに書いたとおりにスキーマができる |
| 実装（保存処理など） | NestJS | Handler URL に POST が飛ぶので、そのエンドポイントを実装する |

**毎回手動でコンソールからポチポチする必要はありません。** 一度定義した内容を **メタデータとしてリポジトリに置き、Metadata API や Hasura CLI で適用** すれば、環境の立ち上げや再現は「メタデータを apply する」だけで済みます。このドキュメントの「5. Metadata API で登録する場合」で、そのための JSON と curl を用意しています。

## 前提

- Docker Compose で PostgreSQL と Hasura が起動していること
- NestJS API が **ホスト** で `http://localhost:3000` で起動していること
- Hasura コンソール: http://localhost:8080

## 1. NestJS 側のエンドポイント

NestJS は次のエンドポイントを用意しています。

| Method | URL | 説明 |
|--------|-----|------|
| POST   | `/hasura/actions/createMemo` | Hasura の `createMemo` Action 用 Webhook |

Hasura が送るリクエスト形式に合わせて `input.content` を受け取り、ドメインロジック実行後にレスポンス型をそのまま返します。

## 2. Hasura から NestJS へ到達する URL

Hasura は **Docker コンテナ内** で動作するため、ホストで動く NestJS を指す URL は次のとおりです。

- **Mac / Windows**: `http://host.docker.internal:3000`
- **Linux**: `host.docker.internal` はデフォルトでないため、`docker-compose.yml` に `extra_hosts: - "host.docker.internal:host-gateway"` を追加するか、ホストの IP を指定してください。

Action の Handler URL 例:

```
http://host.docker.internal:3000/hasura/actions/createMemo
```

## 3. Hasura コンソールで Action を登録する

### 3.1 カスタム型の定義

1. Hasura コンソール → **Data** → **Actions** → **Create**
2. **New types definition** に以下を入力:

```graphql
type CreateMemoResponse {
  id: String!
  content: String!
  createdAt: String!
  updatedAt: String!
}
```

### 3.2 Action の定義

1. **Action definition** に以下を入力:

```graphql
type Mutation {
  createMemo(content: String!): CreateMemoResponse
}
```

2. **Action name**: `createMemo` のまま
3. **Handler webhook**:  
   `http://host.docker.internal:3000/hasura/actions/createMemo`
4. **Create** をクリック

#### 3.2.1 Metadata API で登録する場合（推奨・手動コンソール不要）

コンソールで毎回作成する代わりに、**メタデータをコードで管理** して Metadata API で適用できます。新規環境や Hasura の再作成後も、スクリプト 1 本で Action を復元できます。
リポジトリルートで次を実行します。`HASURA_URL` と `HASURA_ADMIN_SECRET` は未設定時は `docker-compose.yml` の既定値になります。

```bash
./scripts/apply-hasura-metadata.sh
```

環境に合わせて変数を上書きする場合:

```bash
HASURA_URL=http://localhost:8080 HASURA_ADMIN_SECRET=myadminsecretkey ./scripts/apply-hasura-metadata.sh
```

### 3.3 権限（任意）

ロールごとに Action を許可する場合は、**Actions** → **createMemo** → **Permissions** でロール（例: `user`）に権限を追加します。未設定の場合は `admin` のみ実行可能です。

## 4. Hasura コンソールで API を実行する流れ

GraphQL API（Query や Mutation）を実行するには、コンソールの **「API」** タブを使います。「Actions」タブは Action の定義・権限の管理用で、**API の実行**は API タブ（GraphiQL）で行います。

### 手順

1. **事前準備**
   - Hasura が起動している（`docker compose up -d`）
   - 実行したい Action などがメタデータに登録済み（セクション 3 または 3.2.1 で適用済み）
   - Action のハンドラ（例: NestJS）が起動している（`pnpm --filter api dev`）

2. **Hasura コンソールを開く**  
   http://localhost:8080 をブラウザで開く。

3. **API タブを開く**  
   左サイドバーまたは上部の **「API」** をクリック。

4. **Request Headers を設定（必要な場合）**  
   認証が必要な場合は、下の「Request Headers」にヘッダを指定する。admin で実行する例:
   ```json
   { "X-Hasura-Admin-Secret": "" }
   ```
   （`docker-compose.yml` の `HASURA_GRAPHQL_ADMIN_SECRET` と同じ値）

5. **Query / Mutation を入力して実行**  
   左側エディタに GraphQL を書き、▶ Run または Ctrl+Enter で実行する。例（createMemo Mutation）:
   ```graphql
   mutation {
     createMemo(content: "Hasura から登録したメモ") {
       id
       content
       createdAt
       updatedAt
     }
   }
   ```

6. **結果の確認**
   - 右側にレスポンスが表示される。エラー時はメッセージを確認する。
   - テーブルを参照する Query の場合は **Data** タブで該当テーブルの内容も確認できる。createMemo の場合は **memos** に同じレコードが保存されている（NestJS が Prisma で同一 DB に保存しているため）。

## データフローまとめ

```
クライアント
  → GraphQL Mutation createMemo(content: "…")
  → Hasura（受付）
  → POST /hasura/actions/createMemo（NestJS）
  → CreateMemoUseCase（ドメインロジック）
  → Prisma → PostgreSQL（DB 保存）
  → レスポンスを Hasura がそのままクライアントへ返却
```
