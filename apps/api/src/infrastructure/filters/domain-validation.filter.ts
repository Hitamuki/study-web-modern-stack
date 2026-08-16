import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpStatus,
  Logger,
  HttpException,
} from "@nestjs/common";
import type { Response } from "express";
import { DomainValidationError, EntityNotFoundError } from "../../domain/errors/domain.error";

/**
 * ドメイン層の例外を HTTP ステータスへマッピングするフィルター。
 * Nest の HttpException はそのまま透過する。
 *
 * レスポンスボディは `message` を必ず含める。Hasura Actions がエラー時に
 * ハンドラのレスポンスから `message` を読み取り、GraphQL エラーとして返すため。
 */
@Catch(Error)
export class DomainValidationFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainValidationFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      res
        .status(exception.getStatus())
        .json(typeof body === "object" ? body : { message: String(body) });
      return;
    }

    if (exception instanceof EntityNotFoundError) {
      this.logger.warn(exception.message);
      res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof DomainValidationError) {
      this.logger.warn(exception.message);
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      });
      return;
    }

    this.logger.error(exception.message, exception.stack);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
}
