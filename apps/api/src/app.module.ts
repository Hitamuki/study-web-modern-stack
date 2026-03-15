import { Module } from '@nestjs/common';
import { MemoModule } from './infrastructure/memo.module';

@Module({
  imports: [MemoModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
