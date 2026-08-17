import { Injectable } from "@nestjs/common";
import { Dummy } from "../../domain/entities/dummy.entity";
import type { CreateDummyInput, DummyRepository } from "../../domain/repositories/dummy.repository";
import { DummyContent } from "../../domain/value-objects/dummy-content.vo";
import { DummyId } from "../../domain/value-objects/dummy-id.vo";
import { OwnerId } from "../../domain/value-objects/owner-id.vo";
// biome-ignore lint/style/useImportType: Nest の DI は emitDecoratorMetadata が出力する design:paramtypes で解決するため、コンストラクタ引数の型は値として import する
import { PrismaService } from "../persistence/prisma.service";

interface DummyRow {
  id: string;
  ownerId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PrismaDummyRepository implements DummyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create({ ownerId, content, createdAt, updatedAt }: CreateDummyInput): Promise<Dummy> {
    const row = await this.prisma.dummy.create({
      data: { ownerId: ownerId.value, content: content.value, createdAt, updatedAt },
    });
    return this.toDomain(row);
  }

  async update(dummy: Dummy): Promise<Dummy> {
    // owner_id は更新対象に含めない。持ち主の付け替えを永続化層から不可能にしておく。
    const row = await this.prisma.dummy.update({
      where: { id: dummy.id.value },
      data: { content: dummy.content.value, updatedAt: dummy.updatedAt },
    });
    return this.toDomain(row);
  }

  async delete(id: DummyId): Promise<void> {
    await this.prisma.dummy.delete({ where: { id: id.value } });
  }

  async findById(id: DummyId): Promise<Dummy | null> {
    const row = await this.prisma.dummy.findUnique({
      where: { id: id.value },
    });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Dummy[]> {
    const rows = await this.prisma.dummy.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: DummyRow): Dummy {
    return new Dummy(
      new DummyId(row.id),
      new OwnerId(row.ownerId),
      new DummyContent(row.content),
      row.createdAt,
      row.updatedAt,
    );
  }
}
