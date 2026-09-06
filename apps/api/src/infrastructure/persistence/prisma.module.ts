import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/**
 * PrismaService を単一インスタンスで共有するためのモジュール。
 *
 * モジュールごとに provider として登録すると PrismaClient が複数生成され、
 * その数だけコネクションプールが張られる。Supabase の無料枠は同時接続数の上限が
 * 小さいため（project/plan/deploy/findings.md の 6）、接続元は 1 つに保つ。
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
