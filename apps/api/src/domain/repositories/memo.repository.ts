import type { Memo } from '../entities/memo.entity';
import type { MemoId } from '../value-objects/memo-id.vo';

/**
 * メモの永続化を抽象化するリポジトリインターフェース（ドメイン層で定義）
 */
export interface MemoRepository {
  /** 新規メモを永続化し、採番された ID を持つ Memo を返す */
  create(
    content: string,
    createdAt: Date,
    updatedAt: Date,
  ): Promise<Memo>;
  findById(id: MemoId): Promise<Memo | null>;
  findAll(): Promise<Memo[]>;
}
