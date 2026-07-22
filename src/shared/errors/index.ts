import { AppError } from "./app-error";

export { AppError } from "./app-error";

export class NotFoundError extends AppError {
  constructor(message = "资源不存在") {
    super(404, "NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "未登录或 Token 已过期") {
    super(401, "UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "参数校验失败") {
    super(400, "VALIDATION_ERROR", message);
    this.name = "ValidationError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "请求过于频繁") {
    super(429, "RATE_LIMITED", message);
    this.name = "RateLimitError";
  }
}

export class UpstreamError extends AppError {
  constructor(message = "上游服务不可用") {
    super(502, "UPSTREAM_ERROR", message);
    this.name = "UpstreamError";
  }
}

export class InternalError extends AppError {
  constructor(message = "服务器内部错误") {
    super(500, "INTERNAL_ERROR", message);
    this.name = "InternalError";
  }
}
