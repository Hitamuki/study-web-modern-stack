import type { Dummy } from "../../domain/entities/dummy.entity";
import { EntityNotFoundError } from "../../domain/errors/domain.error";
import type { DummyRepository } from "../../domain/repositories/dummy.repository";
import { DummyContent } from "../../domain/value-objects/dummy-content.vo";
import { DummyId } from "../../domain/value-objects/dummy-id.vo";
import { OwnerId } from "../../domain/value-objects/owner-id.vo";
import type { UpdateDummyDto } from "../dtos/dummy.dto";

/**
 * ダミーレコード更新のアプリケーションサービス（ユースケース）。
 * 作成日時を保つため、既存レコードを読み出してから本文だけを差し替える。
 */
export class UpdateDummyUseCase {
  constructor(private readonly dummyRepository: DummyRepository) {}

  async execute(dto: UpdateDummyDto): Promise<Dummy> {
    // 本文と所有者の検証は DB に触れる前に済ませる
    const content = new DummyContent(dto.content);
    const ownerId = new OwnerId(dto.ownerId);
    const id = new DummyId(dto.id);
    const current = await this.dummyRepository.findById(id);
    // 他人のレコードは「見つからない」として扱う。403 を返すと、その ID のレコードが
    // 存在すること自体が漏れるため（Hasura の行レベル権限も同じ考え方で 0 件を返す）。
    if (current === null || !current.isOwnedBy(ownerId)) {
      throw new EntityNotFoundError("Dummy", id.value);
    }
    return this.dummyRepository.update(current.changeContent(content, new Date()));
  }
}
