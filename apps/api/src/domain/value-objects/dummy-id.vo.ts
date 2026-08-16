import { DomainValidationError } from "../errors/domain.error";

/**
 * ダミーレコードの一意識別子を表す Value Object
 */
export class DummyId {
  private readonly _value: string;

  constructor(value: string) {
    if (value == null || typeof value !== "string" || value.trim() === "") {
      throw new DomainValidationError("id は必須です");
    }
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  equals(other: DummyId): boolean {
    return this._value === other._value;
  }
}
