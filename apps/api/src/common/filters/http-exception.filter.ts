import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from '@bmad-cem/shared';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;

        if (resp.errorCode) {
          response.status(status).json({
            statusCode: status,
            message: resp.message as string,
            errorCode: resp.errorCode as string,
          });
          return;
        }

        if (Array.isArray(resp.message)) {
          response.status(status).json({
            statusCode: status,
            message: (resp.message as string[]).join('; '),
            errorCode: ErrorCode.VALIDATION_ERROR,
          });
          return;
        }

        response.status(status).json({
          statusCode: status,
          message: (resp.message as string) || exception.message,
          errorCode: status >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.BAD_REQUEST,
        });
        return;
      }

      response.status(status).json({
        statusCode: status,
        message: exception.message,
        errorCode: status >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.BAD_REQUEST,
      });
      return;
    }

    this.logger.error(
      'Unhandled exception',
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      errorCode: ErrorCode.INTERNAL_ERROR,
    });
  }
}
