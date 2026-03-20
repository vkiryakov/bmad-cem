import { HttpException } from '@nestjs/common';
import { ErrorCode } from '@bmad-cem/shared';

export class BusinessException extends HttpException {
  constructor(statusCode: number, message: string, errorCode: ErrorCode) {
    super({ statusCode, message, errorCode }, statusCode);
  }
}
