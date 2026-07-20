import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

interface ErrorResponseBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_SERVER_ERROR";
    let message = "An unexpected error occurred";
    let details: Array<{ field: string; message: string }> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === "string") {
        // Simple string message (e.g. throw new NotFoundException("Not found"))
        message = exResponse;
        code = this.statusToCode(status);
      } else if (typeof exResponse === "object") {
        const obj = exResponse as Record<string, any>;
        message = obj.message || exception.message;
        code = obj.error || this.statusToCode(status);

        // Handle class-validator validation errors
        if (Array.isArray(obj.message)) {
          details = obj.message.map((msg: string) => ({
            field: "validation",
            message: msg,
          }));
          message = "Validation failed";
          code = "VALIDATION_ERROR";
        }
      }
    } else if (exception instanceof Error) {
      // Don't leak internal error messages in production
      message = process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : exception.message;
      code = "INTERNAL_SERVER_ERROR";
    }

    const body: ErrorResponseBody = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    };

    response.status(status).json(body);
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      422: "UNPROCESSABLE_ENTITY",
      429: "RATE_LIMITED",
      500: "INTERNAL_SERVER_ERROR",
      502: "BAD_GATEWAY",
      503: "SERVICE_UNAVAILABLE",
    };
    return map[status] || "ERROR";
  }
}
