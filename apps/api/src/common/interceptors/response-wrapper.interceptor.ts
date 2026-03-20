import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseWrapperInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((response: unknown) => {
        if (response === null || response === undefined) {
          return { data: null, meta: {} };
        }

        if (
          typeof response === 'object' &&
          response !== null &&
          'data' in response &&
          'meta' in response
        ) {
          return response;
        }

        return { data: response, meta: {} };
      }),
    );
  }
}
