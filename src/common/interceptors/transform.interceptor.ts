import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        let message = 'Success';
        let payload = data;

        // If controller returns an object with `message` and `data` or `payload`
        // lift the message to top-level and remove from payload
        if (data && typeof data === 'object' && 'message' in data) {
          message = data.message;
          // If there's also a `user` or `data` field inside, use that as payload
          if ('data' in data) {
            payload = data.data;
          } else {
            // remove message from payload
            payload = { ...data };
            delete payload.message;
          }
        }

        return {
          statusCode: response.statusCode,
          message,
          data: payload,
        };
      }),
    );
  }
}
