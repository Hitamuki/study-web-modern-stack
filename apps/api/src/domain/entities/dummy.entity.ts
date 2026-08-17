import { DomainValidationError } from "../errors/domain.error";
import type { DummyContent } from "../value-objects/dummy-content.vo";
import type { DummyId } from "../value-objects/dummy-id.vo";
import { OwnerId } from "../value-objects/owner-id.vo";

/**
 * ダミーレコードのドメインエンティティ（集約ルート）。
 * SCR-005 ダミー画面が扱う本文つきレコードを表す。
 */
export class Dummy {
  constructor(
    public readonly id: DummyId,
    public readonly ownerId: OwnerId,
    public readonly content: DummyContent,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  /**
   * 本文だけを差し替えた新しいインスタンスを返す。作成日時と所有者は引き継ぐ。
   * 所有者を引数で受けないのは、更新操作で持ち主を付け替えられないようにするため。
   */
  changeContent(content: DummyContent, updatedAt: Date): Dummy {
    return new Dummy(this.id, this.ownerId, content, this.createdAt, updatedAt);
  }

  /** 所有者がこのレコードの持ち主かどうか */
  isOwnedBy(ownerId: OwnerId): boolean {
    return this.ownerId.equals(ownerId);
  }

  /**
   * 本文と所有者 ID 自体の不変条件は各 Value Object が持つため、
   * ここでは「所有者が欠けていないこと」と日時の整合性だけを見る。
   */
  validate(): void {
    // 型では防げても、JavaScript から直接呼ばれた場合に所有者なしのレコードが生まれるのを防ぐ
    if (!(this.ownerId instanceof OwnerId)) {
      throw new DomainValidationError("所有者が指定されていません");
    }
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
