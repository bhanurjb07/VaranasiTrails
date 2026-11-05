export interface FieldError {
  field: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public errors?: FieldError[],
    public headers?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const badRequest = (message: string, code?: string) => new AppError(400, message, code);
export const unauthorized = (message = "Unauthorized", code?: string) =>
  new AppError(401, message, code);
export const forbidden = (message = "Forbidden", code?: string) =>
  new AppError(403, message, code);
export const notFound = (message = "Not found") => new AppError(404, message);
export const conflict = (message: string, code?: string) => new AppError(409, message, code);
export const tooManyRequests = (message: string, code: string, retryAfterSeconds?: number) =>
  new AppError(
    429,
    message,
    code,
    undefined,
    retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : undefined,
  );
