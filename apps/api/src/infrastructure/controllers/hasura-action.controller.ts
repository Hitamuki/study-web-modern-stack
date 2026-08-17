import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest の DI は emitDecoratorMetadata が出力する design:paramtypes で解決するため、コンストラクタ引数の型は値として import する
import { CreateDummyUseCase } from "../../application/use-case/create-dummy.use-case";
// biome-ignore lint/style/useImportType: 同上
import { DeleteDummyUseCase } from "../../application/use-case/delete-dummy.use-case";
// biome-ignore lint/style/useImportType: 同上
import { UpdateDummyUseCase } from "../../application/use-case/update-dummy.use-case";
import type { Dummy } from "../../domain/entities/dummy.entity";

/**
 * Hasura から送られる Action リクエストのボディ形式
 * @see https://hasura.io/docs/2.0/actions/action-handlers/
 */
interface HasuraActionPayload<TInput> {
  action?: { name: string };
  input?: Partial<TInput>;
  session_variables?: Record<string, string>;
  request_query?: string;
}

/** Action の出力型 DummyPayload（hasura/metadata/actions.graphql と一致させる） */
interface DummyPayload {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/** Action の出力型 DeleteDummyPayload */
interface DeleteDummyPayload {
  id: string;
}

/**
 * Hasura Actions 用 Webhook コントローラー。
 * 「Hasura（受付）→ NestJS（ロジック）→ DB（Prisma 経由）」のデータフローで呼ばれる。
 *
 * 一覧・単体の参照は Hasura が自動生成するクエリを使うため、ここには書き込み系だけを置く。
 */
@Controller("hasura/actions")
export class HasuraActionController {
  constructor(
    private readonly createDummyUseCase: CreateDummyUseCase,
    private readonly updateDummyUseCase: UpdateDummyUseCase,
    private readonly deleteDummyUseCase: DeleteDummyUseCase,
  ) {}

  @Post("createDummy")
  @HttpCode(HttpStatus.OK)
  async createDummy(
    @Body() payload: HasuraActionPayload<{ content: string }>,
  ): Promise<DummyPayload> {
    const ownerId = requireSessionUserId(payload);
    const content = requireString(payload?.input?.content, "content");
    return toDummyPayload(await this.createDummyUseCase.execute({ ownerId, content }));
  }

  @Post("updateDummy")
  @HttpCode(HttpStatus.OK)
  async updateDummy(
    @Body() payload: HasuraActionPayload<{ id: string; content: string }>,
  ): Promise<DummyPayload> {
    const id = requireString(payload?.input?.id, "id");
    const content = requireString(payload?.input?.content, "content");
    return toDummyPayload(await this.updateDummyUseCase.execute({ id, content }));
  }

  @Post("deleteDummy")
  @HttpCode(HttpStatus.OK)
  async deleteDummy(
    @Body() payload: HasuraActionPayload<{ id: string }>,
  ): Promise<DeleteDummyPayload> {
    const id = requireString(payload?.input?.id, "id");
    const deletedId = await this.deleteDummyUseCase.execute({ id });
    return { id: deletedId.value };
  }
}

/**
 * 所有者を `session_variables` から取り出す。
 *
 * **`input` から受け取ってはいけない。** 入力に含めると、クライアントが任意の ID を指定して
 * 他人になりすましたレコードを作れてしまう。`session_variables` は Hasura が JWT の
 * カスタムクレームから組み立てて付与するもので、クライアントは書き換えられない。
 */
function requireSessionUserId(payload: HasuraActionPayload<unknown>): string {
  const userId = payload?.session_variables?.["x-hasura-user-id"];
  if (typeof userId !== "string" || userId.trim() === "") {
    throw new BadRequestException("セッション変数 x-hasura-user-id がありません");
  }
  return userId.trim();
}

/**
 * Action の入力が文字列であることを保証する。
 * ドメインの不変条件ではなく「Hasura から来たペイロードの形」の検証なので、ここで弾く。
 */
function requireString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new BadRequestException(`${field} は文字列で指定してください`);
  }
  return value.trim();
}

function toDummyPayload(dummy: Dummy): DummyPayload {
  return {
    id: dummy.id.value,
    content: dummy.content.value,
    createdAt: dummy.createdAt.toISOString(),
    updatedAt: dummy.updatedAt.toISOString(),
  };
}
