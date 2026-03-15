import { Module } from '@nestjs/common';
import type { MemoRepository } from '../domain/repositories/memo.repository';
import { CreateMemoUseCase } from '../application/use-case/create-memo.use-case';
import { HasuraActionController } from './controllers/hasura-action.controller';
import { MemoController } from './controllers/memo.controller';
import { PrismaService } from './persistence/prisma.service';
import { PrismaMemoRepository } from './repositories/prisma-memo.repository';

export const MEMO_REPOSITORY = Symbol('MemoRepository');

@Module({
  controllers: [MemoController, HasuraActionController],
  providers: [
    PrismaService,
    {
      provide: MEMO_REPOSITORY,
      useClass: PrismaMemoRepository,
    },
    {
      provide: CreateMemoUseCase,
      useFactory: (repo: MemoRepository) => new CreateMemoUseCase(repo),
      inject: [MEMO_REPOSITORY],
    },
  ],
})
export class MemoModule {}
