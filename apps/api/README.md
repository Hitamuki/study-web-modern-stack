# Web API

## ディレクトリ構成 (DDD アーキテクチャ)

本プロジェクトでは、ドメイン駆動設計 (DDD) に基づき、関心事の分離を徹底するために以下の階層構造を採用しています。

```text
src/
└── domain/                 # ドメイン層 (Domain Layer)
    └── model/              # ビジネスロジックの中核
        └── memo/
            ├── memo.entity.ts      # ドメインエンティティ (純粋なTSクラス)
            ├── memo.repository.ts  # リポジトリのインターフェース (抽象)
            └── memo.vo.ts          # Value Objects
└── usecase/                # アプリケーション層 (Application Layer)
    └── memo/
        ├── memo.usecase.ts # アプリケーションサービス (ドメインモデルのオーケストレーション)
        └── dto/            # UseCase 入出力のための DTO
└── infrastructure/         # インフラストラクチャ層 (Infrastructure Layer)
    └── persistence/        # データの永続化に関する実装
        └── prisma/         # Prisma など ORM を利用したリポジトリの実装
            └── prisma-memo.repository.ts
└── presentation/           # プレゼンテーション層 (Interface Layer)
    └── controller/         # HTTP リクエストのハンドリング
        └── memo.controller.ts
```

## データベース (PostgreSQL + Prisma)

- スキーマ: `prisma/schema.prisma`（`docs/er-diagram.md` の定義に準拠）
- 接続: ルートの `docker-compose.yml` で Postgres を起動し、`apps/api` に `.env` を用意する。

```bash
# 例: ルートで
docker compose up -d postgres

# apps/api で .env.example をコピーして .env を作成し、
cd apps/api && cp .env.example .env

# テーブルを作成（スキーマを DB に反映）
pnpm run db:push
```

| コマンド | 説明 |
|----------|------|
| `pnpm run db:push` | スキーマを DB にそのまま反映する（マイグレーション履歴は残らない）。手軽な開発向け。 |
| `pnpm run db:migrate` | マイグレーションを作成・適用する。履歴が `prisma/migrations/` に残り、本番やチーム開発向け。 |
| `pnpm run db:reset` | DB を初期化してから `db:push` する（**全データ削除**）。既存テーブルとスキーマが食い違うときの開発用。 |

既存の `memos` テーブルが別スキーマ（例: Hasura）で作られており `db:push` でエラーになる場合は、**データを削除してよい**開発環境で次を実行する。

```bash
pnpm run db:reset
```

## Hasura Actions 連携

Hasura の Mutation `createMemo` 用に、次の Webhook を用意しています。

| Method | Path | 説明 |
|--------|------|------|
| POST   | `/hasura/actions/createMemo` | Hasura が送る `input: { content }` を受け取り、ドメインロジック実行後に作成メモを返す |

リクエスト・レスポンス形式は [Hasura Action Handlers](https://hasura.io/docs/2.0/actions/action-handlers/) に準拠。Hasura 側の Action 登録手順はリポジトリルートの [docs/hasura-actions-setup.md](../../docs/hasura-actions-setup.md) を参照。
