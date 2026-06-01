import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const responseBody = {
      statusCode: httpStatus,
      success: false,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      message:
        typeof message === 'string'
          ? message
          : (message as any).message || message,
    };

    this.logger.error(
      `[${request.id}] ${request.method} ${request.url} ${httpStatus} - ${JSON.stringify(responseBody.message)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
