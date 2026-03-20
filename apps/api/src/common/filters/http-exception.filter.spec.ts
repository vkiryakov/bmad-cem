import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { ErrorCode } from '@bmad-cem/shared';
import { BusinessException } from '../exceptions/business.exception';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: { switchToHttp: () => { getResponse: () => typeof mockResponse; getRequest: () => Record<string, unknown> } };

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
      }),
    };
  });

  it('should handle BusinessException with errorCode', () => {
    const exception = new BusinessException(
      HttpStatus.NOT_FOUND,
      'Survey not found',
      ErrorCode.SURVEY_NOT_FOUND,
    );

    filter.catch(exception, mockHost as never);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Survey not found',
      errorCode: ErrorCode.SURVEY_NOT_FOUND,
    });
  });

  it('should handle validation errors with array messages', () => {
    const exception = new HttpException(
      { statusCode: 400, message: ['field must be string', 'field2 required'] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost as never);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'field must be string; field2 required',
      errorCode: ErrorCode.VALIDATION_ERROR,
    });
  });

  it('should handle unknown errors as 500', () => {
    const exception = new Error('unexpected');

    filter.catch(exception, mockHost as never);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      errorCode: ErrorCode.INTERNAL_ERROR,
    });
  });
});
