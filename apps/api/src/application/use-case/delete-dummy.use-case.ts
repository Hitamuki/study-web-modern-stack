import { EntityNotFoundError } from "../../domain/errors/domain.error";
import type { DummyRepository } from "../../domain/repositories/dummy.repository";
import { DummyId } from "../../domain/value-objects/dummy-id.vo";
import { OwnerId } from "../../domain/value-objects/owner-id.vo";
import type { DeleteDummyDto } from "../dtos/dummy.dto";

/**
 * ダミーレコード削除のアプリケーションサービス（ユースケース）
 */
export class DeleteDummyUseCase {
  constructor(private readonly dummyRepository: DummyRepository) {}

  /** 削除したレコードの ID を返す */
  async execute(dto: DeleteDummyDto): Promise<DummyId> {
    const ownerId = new OwnerId(dto.ownerId);
    const id = new DummyId(dto.id);
    const current = await this.dummyRepository.findById(id);
    // 他人のレコードは「見つからない」として扱う（update と同じ理由）
    if (current === null || !current.isOwnedBy(ownerId)) {
      throw new EntityNotFoundError("Dummy", id.value);
    }
    await this.dummyRepository.delete(id);
    return id;
  }
}
