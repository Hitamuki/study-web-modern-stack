import type { Dummy } from "../../domain/entities/dummy.entity";
import type { DummyRepository } from "../../domain/repositories/dummy.repository";

/**
 * ダミーレコード一覧取得のアプリケーションサービス（ユースケース）。
 * 画面の一覧表示は Hasura の自動生成クエリを使うため、これは REST API 用の経路。
 */
export class ListDummiesUseCase {
  constructor(private readonly dummyRepository: DummyRepository) {}

  async execute(): Promise<Dummy[]> {
    return this.dummyRepository.findAll();
  }
}
