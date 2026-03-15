import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DomainValidationFilter } from './infrastructure/filters/domain-validation.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new DomainValidationFilter());
  await app.listen(3000);
}
bootstrap();
