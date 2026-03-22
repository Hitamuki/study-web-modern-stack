# コンテキストマップ

この図は各システム/サービスの役割とデータフローを示したコンテキストマップです。

```mermaid
flowchart TD
  subgraph Hasura
    H[Hasura GraphQL Engine]
  end

  subgraph Backend
    N[NestJS DDD/Clean]
  end

  subgraph Frontend
    W[Web React+Apollo]
    M[Mobile Expo+Apollo]
    D[Desktop Electron+Apollo]
  end

  subgraph Infra
    P[PostgreSQL]
  end

  W -->|GraphQL| H
  M -->|GraphQL| H
  D -->|GraphQL| H
  H -->|Hasura Actions| N
  H -->|SQL auto-generated| P
  N -->|DB access ORM/Query| P
```

### 説明

- **Hasura** は GraphQL Engine として、テーブルに対する CRUD を自動生成します。
- **NestJS** は Hasura Actions によるビジネスロジック（ドメインルール・ユースケース）を実装します。
- **Web / Mobile** は同一の GraphQL API を通じてメモを取得・登録します。