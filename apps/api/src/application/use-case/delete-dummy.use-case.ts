import { EntityNotFoundError } from "../../domain/errors/domain.error";
import type { DummyRepository } from "../../domain/repositories/dummy.repository";
import { DummyId } from "../../domain/value-objects/dummy-id.vo";
import type { DeleteDummyDto } from "../dtos/dummy.dto";

/**
 * ダミーレコード削除のアプリケーションサービス（ユースケース）
 */
export class DeleteDummyUseCase {
  constructor(private readonly dummyRepository: DummyRepository) {}

  /** 削除したレコードの ID を返す */
  async execute(dto: DeleteDummyDto): Promise<DummyId> {
    const id = new DummyId(dto.id);
    if ((await this.dummyRepository.findById(id)) === null) {
      throw new EntityNotFoundError("Dummy", id.value);
    }
    await this.dummyRepository.delete(id);
    return id;
  }
}
