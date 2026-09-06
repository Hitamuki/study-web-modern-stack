import { Module } from "@nestjs/common";
import { HealthController } from "./controllers/health.controller";
import { PrismaModule } from "./persistence/prisma.module";

/** 死活監視のエンドポイントだけを持つモジュール。ドメインには依存しない。 */
@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
})
export class HealthModule {}
