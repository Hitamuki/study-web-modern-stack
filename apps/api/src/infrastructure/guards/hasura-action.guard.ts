import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";
import type { Request } from "express";

/** Hasura の Action 定義から送られてくる共有シークレットのヘッダ名 */
const SECRET_HEADER = "x-hasura-action-secret";

/**
 * Hasura Actions のハンドラを、Hasura からの呼び出しだけに限定する Guard。
 *
 * Actions は Hasura のパーミッションを迂回して NestJS → Prisma に直行するため、
 * このエンドポイントを直接叩かれるとテーブルの行レベル権限では守れない。
 * Hasura が付ける共有シークレットを検証し、一致しなければ 401 で弾く。
 */
@Injectable()
export class HasuraActionGuard implements CanActivate {
  private readonly logger = new Logger(HasuraActionGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.HASURA_ACTION_SECRET;
    // 未設定のまま素通りさせない。設定漏れは「誰でも叩ける」状態と同義のため。
    if (expected === undefined || expected === "") {
      this.logger.error("HASURA_ACTION_SECRET が未設定です。Actions のハンドラを保護できません");
      throw new UnauthorizedException();
    }

    const received = context.switchToHttp().getRequest<Request>().header(SECRET_HEADER);
    if (received === undefined || !safeEquals(received, expected)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}

/**
 * 長さの違いで早期に false を返さない比較。
 * 素の `===` は先頭から順に比較して不一致で打ち切るため、応答時間から少しずつ
 * 正解を推測されうる（タイミング攻撃）。
 */
function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // 長さが違う時点で不一致だが、比較自体は行って所要時間を揃える
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
