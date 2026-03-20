import { of } from 'rxjs';
import { ResponseWrapperInterceptor } from './response-wrapper.interceptor';

describe('ResponseWrapperInterceptor', () => {
  let interceptor: ResponseWrapperInterceptor;

  beforeEach(() => {
    interceptor = new ResponseWrapperInterceptor();
  });

  const mockContext = {} as never;

  it('should wrap response in { data, meta }', (done) => {
    const handler = { handle: () => of({ status: 'ok' }) };

    interceptor.intercept(mockContext, handler).subscribe((result) => {
      expect(result).toEqual({ data: { status: 'ok' }, meta: {} });
      done();
    });
  });

  it('should pass through response that already has data and meta', (done) => {
    const paginatedResponse = {
      data: [1, 2, 3],
      meta: { page: 1, limit: 10, total: 3, totalPages: 1 },
    };
    const handler = { handle: () => of(paginatedResponse) };

    interceptor.intercept(mockContext, handler).subscribe((result) => {
      expect(result).toEqual(paginatedResponse);
      done();
    });
  });

  it('should wrap null response', (done) => {
    const handler = { handle: () => of(null) };

    interceptor.intercept(mockContext, handler).subscribe((result) => {
      expect(result).toEqual({ data: null, meta: {} });
      done();
    });
  });
});
