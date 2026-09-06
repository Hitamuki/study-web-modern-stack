import { Controller, Get, HttpStatus, Logger, Res } from "@nestjs/common";
import type { Response } from "express";
// biome-ignore lint/style/useImportType: Nest の DI は emitDecoratorMetadata が出力する design:paramtypes で解決するため、コンストラクタ引数の型は値として import する
import { PrismaService } from "../persistence/prisma.service";

/**
 * 死活監視用のエンドポイント。**認証は付けない**（UptimeRobot が 10 分ごとに叩く）。
 *
 * DB まで到達させるのが要件である。Render のスピンダウン（15 分）は HTTP に応答すれば
 * 回避できるが、Supabase の一時停止（7 日）の判定は `user database activity` なので、
 * 「200 を返すだけ」の実装では Supabase が止まる。
 * → project/plan/deploy/phase-3.md の「Keep Warm の方式」
 *
 * 返すのは `ok` / `ng` だけにする。認証なしで公開するため、DB のバージョン・
 * テーブル名・件数・スタックトレースを応答に含めない（#86 で消した `/dummies` と
 * 同じ失敗を繰り返さない）。
 */
@Controller("health")
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(@Res({ passthrough: true }) res: Response): Promise<string> {
    try {
      // 実際にクエリを 1 本流す。$connect() の成否だけでは接続が生きている証拠にならない。
      await this.prisma.$queryRaw`SELECT 1`;
      return "ok";
    } catch (error) {
      // 原因はサーバー側のログにだけ残し、応答には出さない。
      this.logger.error(
        "ヘルスチェックで DB に到達できませんでした",
        error instanceof Error ? error.stack : String(error),
      );
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
      return "ng";
    }
  }
}
