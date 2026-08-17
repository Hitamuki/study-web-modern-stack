import { DomainValidationError } from "../errors/domain.error";

/** RFC 4122 の 8-4-4-4-12 形式。バージョンとバリアントまでは問わない。 */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * レコードの所有者を表す Value Object。
 *
 * 値は Supabase Auth のユーザー ID（`auth.users.id`、JWT の `sub` クレーム）で、形式は UUID。
 * ユーザーの実体は Supabase 側の別 PostgreSQL にあるため、このプロジェクトの DB には
 * users テーブルを持たず外部キー制約も張れない。存在確認ができない代わりに、
 * 「UUID として妥当か」の検証をここで強制して不正な値が永続化されるのを防ぐ。
 */
export class OwnerId {
  private readonly _value: string;

  constructor(value: string) {
    if (value == null || typeof value !== "string" || value.trim() === "") {
      throw new DomainValidationError("所有者 ID は必須です");
    }
    // PostgreSQL の uuid 型は小文字で正規化して保持するため、比較が食い違わないよう揃える
    const normalized = value.trim().toLowerCase();
    if (!UUID_PATTERN.test(normalized)) {
      throw new DomainValidationError("所有者 ID は UUID 形式で指定してください");
    }
    this._value = normalized;
  }

  get value(): string {
    return this._value;
  }

  equals(other: OwnerId): boolean {
    return this._value === other._value;
  }
}
