import { MemoId } from '../value-objects/memo-id.vo';

const CONTENT_MAX_LENGTH = 10_000;

/**
 * メモのドメインエンティティ（集約ルート）
 */
export class Memo {
  constructor(
    public readonly id: MemoId,
    public readonly content: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  /**
   * ドメインの不変条件・ビジネスルールに基づくバリデーション
   */
  validate(): void {
    if (this.content == null || typeof this.content !== 'string') {
      throw new Error('Memo content must be a string');
    }
    const trimmed = this.content.trim();
    if (trimmed.length === 0) {
      throw new Error('Memo content must not be empty');
    }
    if (this.content.length > CONTENT_MAX_LENGTH) {
      throw new Error(
        `Memo content must not exceed ${CONTENT_MAX_LENGTH} characters`,
      );
    }
    if (
      this.createdAt == null ||
      !(this.createdAt instanceof Date) ||
      Number.isNaN(this.createdAt.getTime())
    ) {
      throw new Error('Memo createdAt must be a valid Date');
    }
    if (
      this.updatedAt == null ||
      !(this.updatedAt instanceof Date) ||
      Number.isNaN(this.updatedAt.getTime())
    ) {
      throw new Error('Memo updatedAt must be a valid Date');
    }
    if (this.updatedAt.getTime() < this.createdAt.getTime()) {
      throw new Error('Memo updatedAt must not be earlier than createdAt');
    }
  }
}
