import { Injectable } from '@nestjs/common';
import { Memo } from '../../domain/entities/memo.entity';
import type { CreateMemoInput, MemoRepository } from '../../domain/repositories/memo.repository';
import { MemoId } from '../../domain/value-objects/memo-id.vo';
import { PrismaService } from '../persistence/prisma.service';

@Injectable()
export class PrismaMemoRepository implements MemoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create({ content, createdAt, updatedAt }: CreateMemoInput): Promise<Memo> {
    const row = await this.prisma.memo.create({
      data: { content, createdAt, updatedAt },
    });
    return this.toDomain(row);
  }

  async findById(id: MemoId): Promise<Memo | null> {
    const row = await this.prisma.memo.findUnique({
      where: { id: id.value },
    });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Memo[]> {
    const rows = await this.prisma.memo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }): Memo {
    return new Memo(
      new MemoId(row.id),
      row.content,
      row.createdAt,
      row.updatedAt,
    );
  }
}
