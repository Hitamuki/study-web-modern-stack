/**
 * ドメイン層が投げる例外の基底クラス。
 * インフラ層のフィルターは、この型で分岐して HTTP ステータスへマッピングする。
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/**
 * 不変条件・ビジネスルールに違反した場合の例外（400 相当）
 */
export class DomainValidationError extends DomainError {}

/**
 * 指定された識別子のエンティティが存在しない場合の例外（404 相当）
 */
export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, id: string) {
    super(`${entityName} (id: ${id}) が見つかりません`);
  }
}
