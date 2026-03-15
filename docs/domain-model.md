# ドメインモデル図

このドキュメントでは、メモ共有アプリのドメインモデルを示します。

```mermaid
classDiagram
  class Memo {
    +MemoId id
    +string content
    +Date createdAt
    +Date updatedAt
    +void validate()
  }

  class MemoId {
    +string value
  }

  class MemoRepository {
    <<interface>>
    +save(memo: Memo): Promise<void>
    +findById(id: MemoId): Promise<Memo | null>
    +findAll(): Promise<Memo[]>
  }

  class CreateMemoUseCase {
    +execute(dto: CreateMemoDto): Promise<Memo>
  }

  Memo --> MemoId
  CreateMemoUseCase ..> Memo : creates
  CreateMemoUseCase ..> MemoRepository : uses
```

### キーコンセプト

- **Entity**: `Memo` は識別子を持つ集約ルートで、バリデーションやビジネスルールを自身で保持します。
- **Value Object**: `MemoId` は不変の識別子を表現します。
- **Repository**: ドメインからデータアクセスの詳細を切り離し、インフラ層で実装します。
- **Use Case**: `CreateMemoUseCase` がアプリケーション固有のユースケースを定義します。