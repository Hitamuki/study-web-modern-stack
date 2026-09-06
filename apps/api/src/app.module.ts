import { Module } from "@nestjs/common";
import { DummyModule } from "./infrastructure/dummy.module";
import { HealthModule } from "./infrastructure/health.module";

@Module({
  imports: [DummyModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
