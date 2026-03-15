import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CreateMemoUseCase } from '../../application/use-case/create-memo.use-case';

/**
 * Hasura から送られる Action リクエストのボディ形式
 * @see https://hasura.io/docs/2.0/actions/action-handlers/
 */
interface HasuraActionPayload {
  action: { name: string };
  input: { content: string };
  session_variables?: Record<string, string>;
  request_query?: string;
}

/**
 * createMemo Action のレスポンス型（Hasura の Action 出力型と一致させる）
 */
interface CreateMemoActionResponse {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hasura Actions 用 Webhook コントローラー。
 * 「Hasura（受付）→ NestJS（ロジック）→ DB（Prisma 経由）」のデータフローで呼ばれる。
 */
@Controller('hasura/actions')
export class HasuraActionController {
  constructor(private readonly createMemoUseCase: CreateMemoUseCase) {}

  @Post('createMemo')
  @HttpCode(HttpStatus.CREATED)
  async createMemo(
    @Body() payload: HasuraActionPayload,
    @Res() res: Response,
  ): Promise<void> {
    const input = payload?.input;
    if (!input || typeof input.content !== 'string') {
      res.status(400).json({
        message: 'Invalid input: content (string) is required',
      });
      return;
    }

    try {
      const memo = await this.createMemoUseCase.execute({
        content: input.content.trim(),
      });
      const body: CreateMemoActionResponse = {
        id: memo.id.value,
        content: memo.content,
        createdAt: memo.createdAt.toISOString(),
        updatedAt: memo.updatedAt.toISOString(),
      };
      res.status(HttpStatus.CREATED).json(body);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create memo';
      res.status(422).json({ message });
    }
  }
}
