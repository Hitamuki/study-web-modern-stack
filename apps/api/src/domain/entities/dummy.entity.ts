import { DomainValidationError } from "../errors/domain.error";
import type { DummyContent } from "../value-objects/dummy-content.vo";
import type { DummyId } from "../value-objects/dummy-id.vo";

/**
 * ダミーレコードのドメインエンティティ（集約ルート）。
 * SCR-005 ダミー画面が扱う本文つきレコードを表す。
 */
export class Dummy {
  constructor(
    public readonly id: DummyId,
    public readonly content: DummyContent,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  /**
   * 本文だけを差し替えた新しいインスタンスを返す。作成日時は引き継ぐ。
   */
  changeContent(content: DummyContent, updatedAt: Date): Dummy {
    return new Dummy(this.id, content, this.createdAt, updatedAt);
  }

  /**
   * 本文自体の不変条件は DummyContent が持つため、ここでは日時の整合性だけを見る。
   */
  validate(): void {
    assertValidDate(this.createdAt, "作成日時");
    assertValidDate(this.updatedAt, "更新日時");
    if (this.updatedAt.getTime() < this.createdAt.getTime()) {
      throw new DomainValidationError("更新日時が作成日時より前になっています");
    }
  }
}

function assertValidDate(value: Date, label: string): void {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new DomainValidationError(`${label}が不正です`);
  }
}
