import type { Dummy } from "../entities/dummy.entity";
import type { DummyContent } from "../value-objects/dummy-content.vo";
import type { DummyId } from "../value-objects/dummy-id.vo";
import type { OwnerId } from "../value-objects/owner-id.vo";

/**
 * 新規作成の入力。ID は永続化層が採番するため含めない。
 * 本文と所有者を Value Object で受けることで、リポジトリに渡る時点で検証済みであることを型で保証する。
 */
export interface CreateDummyInput {
  ownerId: OwnerId;
  content: DummyContent;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ダミーレコードの永続化を抽象化するリポジトリインターフェース（ドメイン層で定義）
 */
export interface DummyRepository {
  /** 新規レコードを永続化し、採番された ID を持つ Dummy を返す */
  create(input: CreateDummyInput): Promise<Dummy>;
  /** 既存レコードを上書きする */
  update(dummy: Dummy): Promise<Dummy>;
  /** 既存レコードを削除する */
  delete(id: DummyId): Promise<void>;
  findById(id: DummyId): Promise<Dummy | null>;
}
