import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest の DI は emitDecoratorMetadata が出力する design:paramtypes で解決するため、コンストラクタ引数の型は値として import する
import { CreateDummyUseCase } from "../../application/use-case/create-dummy.use-case";
// biome-ignore lint/style/useImportType: 同上
import { DeleteDummyUseCase } from "../../application/use-case/delete-dummy.use-case";
// biome-ignore lint/style/useImportType: 同上
import { ListDummiesUseCase } from "../../application/use-case/list-dummies.use-case";
// biome-ignore lint/style/useImportType: 同上
import { UpdateDummyUseCase } from "../../application/use-case/update-dummy.use-case";
import type { Dummy } from "../../domain/entities/dummy.entity";

/** ダミーレコードのレスポンス表現 */
interface DummyResponse {
  id: string;
  ownerId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ダミーレコードの HTTP API を提供するコントローラー（Hasura を経由しない直接アクセス用）
 *
 * > [!WARNING]
 * > このコントローラーには認証がなく、所有者をリクエストボディから受け取る。
 * > そのため呼び出し元は任意のユーザーになりすませる。ローカル検証専用であり、
 * > 公開環境に出す前に認証を入れるか、ルーティングごと外す必要がある。
 * > 認証を通す正規の経路は Hasura Actions（`hasura-action.controller.ts`）で、
 * > そちらは所有者をセッション変数から取る。
 */
@Controller("dummies")
export class DummyController {
  constructor(
    private readonly listDummiesUseCase: ListDummiesUseCase,
    private readonly createDummyUseCase: CreateDummyUseCase,
    private readonly updateDummyUseCase: UpdateDummyUseCase,
    private readonly deleteDummyUseCase: DeleteDummyUseCase,
  ) {}

  @Get()
  async list(): Promise<DummyResponse[]> {
    const dummies = await this.listDummiesUseCase.execute();
    return dummies.map(toResponse);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: { ownerId: string; content: string }): Promise<DummyResponse> {
    return toResponse(
      await this.createDummyUseCase.execute({ ownerId: dto?.ownerId, content: dto?.content }),
    );
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: { content: string }): Promise<DummyResponse> {
    return toResponse(await this.updateDummyUseCase.execute({ id, content: dto?.content }));
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string): Promise<void> {
    await this.deleteDummyUseCase.execute({ id });
  }
}

function toResponse(dummy: Dummy): DummyResponse {
  return {
    id: dummy.id.value,
    ownerId: dummy.ownerId.value,
    content: dummy.content.value,
    createdAt: dummy.createdAt.toISOString(),
    updatedAt: dummy.updatedAt.toISOString(),
  };
}
