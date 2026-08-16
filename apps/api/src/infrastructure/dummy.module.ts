import { Module } from "@nestjs/common";
import { CreateDummyUseCase } from "../application/use-case/create-dummy.use-case";
import { DeleteDummyUseCase } from "../application/use-case/delete-dummy.use-case";
import { ListDummiesUseCase } from "../application/use-case/list-dummies.use-case";
import { UpdateDummyUseCase } from "../application/use-case/update-dummy.use-case";
import type { DummyRepository } from "../domain/repositories/dummy.repository";
import { DummyController } from "./controllers/dummy.controller";
import { HasuraActionController } from "./controllers/hasura-action.controller";
import { PrismaService } from "./persistence/prisma.service";
import { PrismaDummyRepository } from "./repositories/prisma-dummy.repository";

export const DUMMY_REPOSITORY = Symbol("DummyRepository");

/**
 * UseCase はドメイン層のインターフェースにだけ依存するため、実装は DI トークン経由で注入する。
 * 4 つとも「リポジトリ 1 つを受け取る」形が同じなので、生成をまとめる。
 */
const provideUseCase = <T>(UseCase: new (repo: DummyRepository) => T) => ({
  provide: UseCase,
  useFactory: (repo: DummyRepository) => new UseCase(repo),
  inject: [DUMMY_REPOSITORY],
});

@Module({
  controllers: [DummyController, HasuraActionController],
  providers: [
    PrismaService,
    {
      provide: DUMMY_REPOSITORY,
      useClass: PrismaDummyRepository,
    },
    provideUseCase(CreateDummyUseCase),
    provideUseCase(UpdateDummyUseCase),
    provideUseCase(DeleteDummyUseCase),
    provideUseCase(ListDummiesUseCase),
  ],
})
export class DummyModule {}
