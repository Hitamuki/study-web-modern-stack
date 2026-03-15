/**
 * メモの一意識別子を表す Value Object
 */
export class MemoId {
  private readonly _value: string;

  constructor(value: string) {
    if (value == null || value.trim() === '') {
      throw new Error('MemoId must not be empty');
    }
    this._value = value.trim();
  }

  get value(): string {
    return this._value;
  }

  equals(other: MemoId): boolean {
    return this._value === other._value;
  }
}
