import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * ドメインのバリデーションエラー（Error）を 400 Bad Request にマッピングするフィルター。
 * Nest の HttpException はそのまま透過する。
 */
@Catch(Error)
export class DomainValidationFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainValidationFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    if (exception instanceof HttpException) {
      const ctx = host.switchToHttp();
      const res = ctx.getResponse<Response>();
      const status = exception.getStatus();
      const body = exception.getResponse();
      res.status(status).json(typeof body === 'object' ? body : { message: body });
      return;
    }

    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const isDomainValidation =
      exception.message.startsWith('Memo ') ||
      exception.message.startsWith('MemoId ');

    if (isDomainValidation) {
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
      message: 'Internal server error',
    });
  }
}
