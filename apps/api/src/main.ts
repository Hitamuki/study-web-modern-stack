import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DomainValidationFilter } from "./infrastructure/filters/domain-validation.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new DomainValidationFilter());
  // 既定は 3001。NestJS の慣例は 3000 ですが、.mcp.json の drawio-mcp-server が
  // ブラウザ拡張との橋渡しに 3000 を使うため、衝突を避けて 1 つずらしています。
  // hasura/metadata/actions.yaml の handler がこのポートを指しているため、
  // 変更する場合は Hasura 側の handler URL も合わせて直すこと。
  await app.listen(Number(process.env.PORT ?? 3001));
}
bootstrap();
