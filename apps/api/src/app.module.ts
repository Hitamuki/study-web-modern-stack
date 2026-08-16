import { Module } from "@nestjs/common";
import { DummyModule } from "./infrastructure/dummy.module";

@Module({
  imports: [DummyModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
