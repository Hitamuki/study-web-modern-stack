import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CreateMemoUseCase } from '../../application/use-case/create-memo.use-case';
import type { CreateMemoDto } from '../../application/dtos/create-memo.dto';

/** メモレスポンスのシリアライズ用 */
interface MemoResponse {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * メモに関する HTTP API を提供するコントローラー（外部公開用）
 */
@Controller('memos')
export class MemoController {
  constructor(private readonly createMemoUseCase: CreateMemoUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMemoDto): Promise<MemoResponse> {
    const memo = await this.createMemoUseCase.execute(dto);
    return this.toResponse(memo);
  }

  private toResponse(memo: {
    id: { value: string };
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }): MemoResponse {
    return {
      id: memo.id.value,
      content: memo.content,
      createdAt: memo.createdAt.toISOString(),
      updatedAt: memo.updatedAt.toISOString(),
    };
  }
}
