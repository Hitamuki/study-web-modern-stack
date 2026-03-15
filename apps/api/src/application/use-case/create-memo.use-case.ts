import type { Memo } from '../../domain/entities/memo.entity';
import type { MemoRepository } from '../../domain/repositories/memo.repository';
import type { CreateMemoDto } from '../dtos/create-memo.dto';

/**
 * メモ登録のアプリケーションサービス（ユースケース）
 */
export class CreateMemoUseCase {
  constructor(private readonly memoRepository: MemoRepository) {}

  async execute(dto: CreateMemoDto): Promise<Memo> {
    const now = new Date();
    return this.memoRepository.create(dto.content, now, now);
  }
}
