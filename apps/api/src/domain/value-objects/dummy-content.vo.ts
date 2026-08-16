import { DomainValidationError } from "../errors/domain.error";

const MAX_LENGTH = 10_000;

/**
 * ダミーレコードの本文を表す Value Object。
 *
 * 本文の不変条件をここに閉じ込めているのは、永続化より前に検証を強制するため。
 * エンティティのコンストラクタだけで検証すると、リポジトリが INSERT してから
 * ドメインオブジェクトを組み立てる実装になったときに不正な行が残ってしまう。
 */
export class DummyContent {
  private readonly _value: string;

  constructor(value: string) {
    if (value == null || typeof value !== "string") {
      throw new DomainValidationError("本文は文字列である必要があります");
    }
    if (value.trim().length === 0) {
      throw new DomainValidationError("本文を入力してください");
    }
    if (value.length > MAX_LENGTH) {
      throw new DomainValidationError(`本文は ${MAX_LENGTH} 文字以内で入力してください`);
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: DummyContent): boolean {
    return this._value === other._value;
  }
}
