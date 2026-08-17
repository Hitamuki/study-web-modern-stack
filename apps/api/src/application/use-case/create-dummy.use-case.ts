import type { Dummy } from "../../domain/entities/dummy.entity";
import type { DummyRepository } from "../../domain/repositories/dummy.repository";
import { DummyContent } from "../../domain/value-objects/dummy-content.vo";
import { OwnerId } from "../../domain/value-objects/owner-id.vo";
import type { CreateDummyDto } from "../dtos/dummy.dto";

/**
 * ダミーレコード登録のアプリケーションサービス（ユースケース）
 */
export class CreateDummyUseCase {
  constructor(private readonly dummyRepository: DummyRepository) {}

  async execute(dto: CreateDummyDto): Promise<Dummy> {
    // 所有者と本文の検証は DB に触れる前に済ませる
    const ownerId = new OwnerId(dto.ownerId);
    const content = new DummyContent(dto.content);
    const now = new Date();
    return this.dummyRepository.create({ ownerId, content, createdAt: now, updatedAt: now });
  }
}
