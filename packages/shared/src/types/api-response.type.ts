import { ErrorCode } from '../enums/error-code.enum';

export interface IApiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface IApiError {
  statusCode: number;
  message: string;
  errorCode: ErrorCode;
}
