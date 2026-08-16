import type { Dummy } from "../../domain/entities/dummy.entity";
import type { DummyRepository } from "../../domain/repositories/dummy.repository";
import { DummyContent } from "../../domain/value-objects/dummy-content.vo";
import type { CreateDummyDto } from "../dtos/dummy.dto";

/**
 * ダミーレコード登録のアプリケーションサービス（ユースケース）
 */
export class CreateDummyUseCase {
  constructor(private readonly dummyRepository: DummyRepository) {}

  async execute(dto: CreateDummyDto): Promise<Dummy> {
    // 本文の検証は DB に触れる前に済ませる
    const content = new DummyContent(dto.content);
    const now = new Date();
    return this.dummyRepository.create({ content, createdAt: now, updatedAt: now });
  }
}
