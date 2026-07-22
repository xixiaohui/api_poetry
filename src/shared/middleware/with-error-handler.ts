import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/shared/errors";
import { errorResponse } from "@/lib/response";
import { logger } from "@/shared/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (request: NextRequest, context?: any) => Promise<NextResponse>;

export function withErrorHandler(handler: Handler): Handler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (request: NextRequest, context?: any) => {
    const start = Date.now();
    try {
      const response = await handler(request, context);
      logger.info({
        method: request.method,
        path: request.nextUrl.pathname,
        status: response.status,
        duration: Date.now() - start,
      }, "request completed");
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      if (error instanceof AppError) {
        logger.warn({
          method: request.method,
          path: request.nextUrl.pathname,
          status: error.statusCode,
          code: error.code,
          duration,
        }, error.message);
        return errorResponse(error.code, error.message, error.statusCode);
      }
      logger.error({
        method: request.method,
        path: request.nextUrl.pathname,
        duration,
        error: (error as Error).message,
      }, "unhandled error");
      return errorResponse("INTERNAL_ERROR", "服务器内部错误", 500);
    }
  };
}
