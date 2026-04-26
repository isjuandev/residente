import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import * as Sentry from "@sentry/nestjs";
import { Request, Response } from "express";

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request & { user?: { id?: string; email?: string; role?: string } }>();
    const response = context.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) {
      Sentry.withScope((scope) => {
        scope.setTag("http.method", request.method);
        scope.setTag("http.route", request.route?.path ?? request.path);
        scope.setContext("request", {
          url: request.url,
          params: request.params,
          query: request.query
        });
        if (request.user) {
          scope.setUser({
            id: request.user.id,
            email: request.user.email,
            role: request.user.role
          });
        }
        Sentry.captureException(exception);
      });
    }

    const message =
      exception instanceof HttpException
        ? exception.message
        : "Error interno del servidor";

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url
    });
  }
}
